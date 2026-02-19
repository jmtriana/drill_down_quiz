
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

    // Dimensions for vertical layout
    const width = 1100;
    const height = 600;
    const margin = { top: 80, right: 40, bottom: 80, left: 40 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const buildTreeData = () => {
      // Level 0: Total
      const root = { 
        name: quiz.initialLabel, 
        displayValue: quiz.initialTotal.toLocaleString(),
        isRevealed: true, 
        isCorrect: true,
        children: [] as any[] 
      };
      
      const isQ1Revealed = revealedQuestions.includes(0);
      const isQ2Revealed = revealedQuestions.includes(1);
      const isQ3Revealed = revealedQuestions.includes(2);
      const isQ4Revealed = revealedQuestions.includes(3);

      if (isQ1Revealed || revealedQuestions.length > 0) {
        const q1 = quiz.questions[0];
        // Level 1: Personas & Empresariales
        root.children = q1.optionLabels.map((label, idx) => {
          const node: any = {
            name: label,
            displayValue: isQ1Revealed ? q1.optionValues[idx].toLocaleString() : '?',
            isRevealed: isQ1Revealed,
            isCorrect: idx === q1.correctIndex,
            children: [] as any[]
          };

          // Logic for EMPRESARIALES (Straight to Activos/Inactivos when Q3 is reached)
          if (label === "Empresariales" && isQ3Revealed) {
            const comp = HIERARCHY_MAP["Empresariales"];
            node.children = comp.labels.map((cLab: string, cIdx: number) => ({
              name: cLab,
              displayValue: comp.values[cIdx].toLocaleString(),
              isRevealed: true,
              isCorrect: false,
              children: []
            }));
          }

          // Logic for PERSONAS (DVP/Comunes/DAV first)
          if (label === "Personas" && (isQ2Revealed || revealedQuestions.length > 1)) {
            const q2 = quiz.questions[1];
            node.children = q2.optionLabels.map((pLabel, pIdx) => {
              const pNode: any = {
                name: pLabel,
                displayValue: isQ2Revealed ? q2.optionValues[pIdx].toLocaleString() : '?',
                isRevealed: isQ2Revealed,
                isCorrect: pIdx === q2.correctIndex,
                children: [] as any[]
              };

              // Level 3: Activos/Inactivos for all Personas groups (Global revelation on Q3)
              if (isQ3Revealed) {
                if (pLabel === "Exclusivos DVP") {
                  const q3 = quiz.questions[2];
                  pNode.children = q3.optionLabels.map((actLabel, actIdx) => {
                    const actNode: any = {
                      name: actLabel,
                      displayValue: isQ3Revealed ? q3.optionValues[actIdx].toLocaleString() : '?',
                      isRevealed: isQ3Revealed,
                      isCorrect: actIdx === q3.correctIndex,
                      children: [] as any[]
                    };

                    // Level 4: Principalidad (DVP Only)
                    if (isQ4Revealed && actLabel === "Activos") {
                      const q4 = quiz.questions[3];
                      actNode.children = q4.optionLabels.map((prinLabel, prinIdx) => ({
                        name: prinLabel,
                        displayValue: isQ4Revealed ? q4.optionValues[prinIdx].toLocaleString() : '?',
                        isRevealed: isQ4Revealed,
                        isCorrect: prinIdx === q4.correctIndex,
                        children: []
                      }));
                    }
                    return actNode;
                  });
                } else if (HIERARCHY_MAP[pLabel]) {
                  const comp = HIERARCHY_MAP[pLabel];
                  pNode.children = comp.labels.map((cLab: string, cIdx: number) => ({
                    name: cLab,
                    displayValue: comp.values[cIdx].toLocaleString(),
                    isRevealed: true,
                    isCorrect: false,
                    children: []
                  }));
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
    
    // Switch tree layout to Vertical: size is [width, height]
    const treeLayout = d3.tree().size([width - margin.left - margin.right, height - margin.top - margin.bottom]);
    treeLayout(treeRoot);

    // Links (Vertical)
    svg.selectAll(".link")
      .data(treeRoot.links())
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.target.data.isCorrect ? "#6366f1" : "#e2e8f0")
      .attr("stroke-width", (d: any) => d.target.data.isCorrect ? 3 : 1.5)
      .attr("d", d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any)
      .attr("stroke-dasharray", "2000")
      .attr("stroke-dashoffset", "2000")
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", "0");

    // Nodes
    const node = svg.selectAll(".node")
      .data(treeRoot.descendants())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    // Circle Node
    node.append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => d.data.isCorrect ? "#6366f1" : "#fff")
      .attr("stroke", (d: any) => d.data.isCorrect ? "#4f46e5" : "#e2e8f0")
      .attr("stroke-width", 2.5)
      .style("filter", "drop-shadow(0 4px 6px rgb(0 0 0 / 0.05))")
      .transition()
      .duration(600)
      .delay((d, i) => i * 30)
      .attr("r", 7);

    // Label Text (Positioned clearly above the node)
    node.append("text")
      .attr("dy", "-1.8em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.name)
      .style("font-size", "9px")
      .style("font-weight", "900")
      .style("fill", (d: any) => d.data.isCorrect ? "#1e293b" : "#94a3b8")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .style("opacity", 1);

    // Value Text (Positioned clearly below the node)
    node.append("text")
      .attr("dy", "2.8em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.displayValue)
      .style("font-size", "10px")
      .style("font-weight", "800")
      .style("fill", (d: any) => d.data.isCorrect ? "#6366f1" : "#cbd5e1")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => i * 50)
      .style("opacity", 1);

  }, [quiz, revealedQuestions]);

  return (
    <div className="w-full bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-indigo-100/10 overflow-hidden">
      <div className="p-8 bg-slate-50/50 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Estructura Jerárquica de Cartera</h3>
          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Vista Vertical de Drill-Down</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200"></div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ruta de Análisis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300"></div>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Segmentos Complemento</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto p-4 bg-white flex justify-center">
        <svg ref={svgRef} className="w-full h-[600px] min-w-[1000px]"></svg>
      </div>
    </div>
  );
};

export default TreeChart;
