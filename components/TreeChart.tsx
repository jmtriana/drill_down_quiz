
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QuizData } from '../types';
import { HIERARCHY_MAP } from '../data/staticQuiz';

interface TreeChartProps {
  quiz: QuizData;
  revealedQuestions: number[];
}

const TreeChart: React.FC<TreeChartProps> = ({ quiz, revealedQuestions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !quiz) return;

    const width = 1100;
    const height = 750;
    const margin = { top: 60, right: 40, bottom: 80, left: 40 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const isQ1Revealed = revealedQuestions.includes(0);
    const isQ2Revealed = revealedQuestions.includes(1);
    const isQ3Revealed = revealedQuestions.includes(2);
    const isQ4Revealed = revealedQuestions.includes(3);

    const addPrincipalityLevel = (parentValue: number) => {
      if (!isQ4Revealed) return [];
      const q4 = quiz.questions[3];
      return q4.optionLabels.map((pLabel, pIdx) => {
        return {
          name: pLabel,
          displayValue: Math.round(parentValue * (pIdx === 0 ? 0.63 : 0.37)).toLocaleString(),
          isRevealed: true,
          isCorrect: true, 
          children: []
        };
      });
    };

    const buildTreeData = () => {
      const root = { 
        name: quiz.initialLabel, 
        displayValue: quiz.initialTotal.toLocaleString(),
        isRevealed: true, 
        isCorrect: true,
        children: [] as any[] 
      };
      
      if (isQ1Revealed || revealedQuestions.length > 0) {
        const q1 = quiz.questions[0];
        root.children = q1.optionLabels.map((label, idx) => {
          const node: any = {
            name: label,
            displayValue: isQ1Revealed ? q1.optionValues[idx].toLocaleString() : '?',
            isRevealed: isQ1Revealed,
            isCorrect: true,
            children: [] as any[]
          };

          if (label === "Empresariales" && isQ3Revealed) {
            const comp = HIERARCHY_MAP["Empresariales"];
            node.children = comp.labels.map((cLab: string, cIdx: number) => {
              const cNode: any = {
                name: cLab,
                displayValue: comp.values[cIdx].toLocaleString(),
                isRevealed: true,
                isCorrect: true,
                children: []
              };
              if (cLab === "Activos") {
                cNode.children = addPrincipalityLevel(comp.values[cIdx]);
              }
              return cNode;
            });
          }

          if (label === "Personas" && (isQ2Revealed || revealedQuestions.length > 1)) {
            const q2 = quiz.questions[1];
            node.children = q2.optionLabels.map((pLabel, pIdx) => {
              const pNode: any = {
                name: pLabel,
                displayValue: isQ2Revealed ? q2.optionValues[pIdx].toLocaleString() : '?',
                isRevealed: isQ2Revealed,
                isCorrect: true,
                children: [] as any[]
              };

              if (isQ3Revealed) {
                if (pLabel === "Exclusivos DVP") {
                  const q3 = quiz.questions[2];
                  pNode.children = q3.optionLabels.map((actLabel, actIdx) => {
                    const actNode: any = {
                      name: actLabel,
                      displayValue: isQ3Revealed ? q3.optionValues[actIdx].toLocaleString() : '?',
                      isRevealed: isQ3Revealed,
                      isCorrect: true,
                      children: [] as any[]
                    };

                    if (actLabel === "Activos") {
                      if (isQ4Revealed) {
                        const q4 = quiz.questions[3];
                        actNode.children = q4.optionLabels.map((prinLabel, prinIdx) => ({
                          name: prinLabel,
                          displayValue: q4.optionValues[prinIdx].toLocaleString(),
                          isRevealed: true,
                          isCorrect: true,
                          children: []
                        }));
                      }
                    }
                    return actNode;
                  });
                } else if (HIERARCHY_MAP[pLabel]) {
                  const comp = HIERARCHY_MAP[pLabel];
                  pNode.children = comp.labels.map((cLab: string, cIdx: number) => {
                    const cNode: any = {
                      name: cLab,
                      displayValue: comp.values[cIdx].toLocaleString(),
                      isRevealed: true,
                      isCorrect: true,
                      children: []
                    };
                    if (cLab === "Activos") {
                      cNode.children = addPrincipalityLevel(comp.values[cIdx]);
                    }
                    return cNode;
                  });
                }
              }
              return pNode;
            });
          }
          return node;
        });
      }
      return root;
    };

    const data = buildTreeData();
    const treeRoot = d3.hierarchy(data);
    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    treeLayout(treeRoot);

    svg.selectAll(".link")
      .data(treeRoot.links())
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.target.data.isRevealed ? "#c90c14" : "#f1f5f9")
      .attr("stroke-width", (d: any) => d.target.data.isRevealed ? 3 : 1.5)
      .attr("d", d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any)
      .attr("stroke-dasharray", "2000")
      .attr("stroke-dashoffset", "2000")
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", "0");

    const node = svg.selectAll(".node")
      .data(treeRoot.descendants())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => d.data.isRevealed ? "#c90c14" : "#fff")
      .attr("stroke", (d: any) => d.data.isRevealed ? "#000" : "#f1f5f9")
      .attr("stroke-width", 2.5)
      .style("filter", "drop-shadow(0 4px 6px rgb(0 0 0 / 0.1))")
      .transition()
      .duration(600)
      .delay((d, i) => i * 20)
      .attr("r", 6);

    node.append("text")
      .attr("dy", "-1.8em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.name)
      .style("font-size", "8px")
      .style("font-weight", "900")
      .style("fill", (d: any) => d.data.isRevealed ? "#000" : "#cbd5e1")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 40)
      .style("opacity", 1);

    node.append("text")
      .attr("dy", "2.8em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.displayValue)
      .style("font-size", "10px")
      .style("font-weight", "900")
      .style("fill", (d: any) => d.data.isRevealed ? "#000" : "#e2e8f0")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 40)
      .style("opacity", 1);

  }, [quiz, revealedQuestions]);

  return (
    <div className="w-full bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-50 overflow-hidden">
      <div className="p-8 bg-slate-50/30 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Estructura Estratégica</h3>
          <p className="text-[9px] font-bold text-[#c90c14] uppercase tracking-widest">Base de Clientes en Tiempo Real</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c90c14] shadow-lg shadow-red-100"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Revelado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-200"></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pendiente</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-4 bg-white flex justify-center">
        <svg ref={svgRef} className="w-full h-[750px] min-w-[1000px]"></svg>
      </div>
    </div>
  );
};

export default TreeChart;
