
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

  const formatCompact = (val: number) => {
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  };

  useEffect(() => {
    if (!svgRef.current || !quiz) return;

    const width = 1600;
    const height = 900; 
    const margin = { top: 100, right: 350, bottom: 100, left: 320 };

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const isQ1Done = revealedQuestions.includes(0);
    const isQ2Done = revealedQuestions.includes(1);
    const isQ3Done = revealedQuestions.includes(2);

    const checkIsPositive = (name: string) => {
      const negatives = ["Inactivo", "Inactivos", "No Principal", "No Activos"];
      return !negatives.includes(name);
    };

    const buildTreeData = () => {
      const root = { 
        name: quiz.initialLabel, 
        rawValue: quiz.initialTotal,
        monetaryValue: quiz.initialMonetaryTotal || 0,
        displayValue: formatCompact(quiz.initialTotal),
        isRevealed: true, 
        isPositive: true,
        logicalLevel: 0,
        children: [] as any[] 
      };
      
      if (isQ1Done || revealedQuestions.length > 0) {
        root.children = quiz.questions[0].optionLabels.map((label, idx) => {
          const node: any = {
            name: label,
            rawValue: quiz.questions[0].optionValues[idx],
            monetaryValue: quiz.questions[0].optionMonetaryValues ? quiz.questions[0].optionMonetaryValues[idx] : 0,
            displayValue: isQ1Done ? formatCompact(quiz.questions[0].optionValues[idx]) : '?',
            isRevealed: isQ1Done,
            isPositive: checkIsPositive(label),
            logicalLevel: 1,
            children: [] as any[]
          };

          // Reveal Level 2 (Actividad) if Q2 is done (entire level)
          if (isQ1Done) {
            let actData: any;
            if (label === "Exclusivos Daviplata") {
              actData = {
                labels: ["Activos", "Inactivos"],
                values: quiz.questions[1].optionValues,
                monetary: quiz.questions[1].optionMonetaryValues,
                principality: quiz.questions[2].optionValues,
                principalityMonetary: quiz.questions[2].optionMonetaryValues
              };
            } else {
              actData = HIERARCHY_MAP[label];
            }

            if (actData) {
              const showAct = isQ2Done; // Reveal entire level if Q2 is done
              node.children = actData.labels.map((actLabel: string, actIdx: number) => {
                const actNode: any = {
                  name: actLabel,
                  rawValue: actData.values[actIdx],
                  monetaryValue: actData.monetary[actIdx],
                  displayValue: showAct ? formatCompact(actData.values[actIdx]) : '?',
                  isRevealed: showAct,
                  isPositive: checkIsPositive(actLabel),
                  logicalLevel: 2,
                  children: []
                };

                if (actLabel === "Activos") {
                  const showPrin = isQ3Done; // Reveal entire level if Q3 is done
                  const pValues = actData.principality;
                  const mValues = actData.principalityMonetary;
                  actNode.children = ["Principal", "No Principal"].map((prinLabel, pIdx) => ({
                    name: prinLabel,
                    rawValue: pValues[pIdx],
                    monetaryValue: mValues[pIdx],
                    displayValue: showPrin ? formatCompact(pValues[pIdx]) : '?',
                    isRevealed: showPrin,
                    isPositive: checkIsPositive(prinLabel),
                    logicalLevel: 3,
                    children: []
                  }));
                }
                return actNode;
              });
            }
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

    const levelHeight = (height - margin.top - margin.bottom) / 3;
    treeRoot.each((d: any) => {
      d.y = d.data.logicalLevel * levelHeight;
    });

    const levelLabels = ["POBLACIÓN", "RELACIONAMIENTO", "ACTIVIDAD", "PRINCIPALIDAD"];
    const levelGroups = svg.selectAll(".level-label")
      .data(levelLabels)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${-margin.left + 20}, ${i * levelHeight})`);

    levelGroups.append("text")
      .text(d => d)
      .attr("dominant-baseline", "middle")
      .style("font-size", "52px")
      .style("font-weight", "900")
      .style("fill", "#000")
      .style("opacity", 0.08)
      .style("letter-spacing", "-0.05em");

    levelGroups.append("line")
      .attr("x1", 0)
      .attr("y1", 32)
      .attr("x2", width - margin.left - 50)
      .attr("y2", 32)
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 2);

    const conclusions = [
      { level: 2, text: "La reactivación de inactivos representa un 15% de crecimiento potencial en volumen transaccional.", revealed: isQ2Done },
      { level: 3, text: "Consolidar el estado de Principalidad impacta un +22% en el Lifetime Value del cliente.", revealed: isQ3Done }
    ];

    const conclusionGroup = svg.selectAll(".conclusion-box")
      .data(conclusions)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${width - margin.left - 300}, ${d.level * levelHeight - 30})`)
      .style("opacity", d => d.revealed ? 1 : 0);

    conclusionGroup.append("rect")
      .attr("width", 280)
      .attr("height", 120)
      .attr("rx", 16)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    conclusionGroup.append("text")
      .attr("x", 15)
      .attr("y", 25)
      .text("INSIGHT ESTRATÉGICO")
      .style("font-size", "9px")
      .style("font-weight", "900")
      .style("fill", "#c90c14")
      .style("letter-spacing", "0.2em");

    const foreignObject = conclusionGroup.append("foreignObject")
      .attr("x", 15)
      .attr("y", 35)
      .attr("width", 250)
      .attr("height", 80);

    foreignObject.append("xhtml:div")
      .attr("xmlns", "http://www.w3.org/1999/xhtml")
      .style("font-size", "15px")
      .style("color", "#475569")
      .style("font-weight", "600")
      .style("line-height", "1.4")
      .style("padding", "0")
      .style("margin", "0")
      .html(d => d.text);

    svg.selectAll(".link")
      .data(treeRoot.links())
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", (d: any) => {
        if (!d.target.data.isRevealed) return "#f1f5f9";
        return d.target.data.isPositive ? "#c90c14" : "#cbd5e1"; 
      })
      .attr("stroke-width", (d: any) => d.target.data.isRevealed ? 3.5 : 1)
      .attr("d", d3.linkVertical().x((d: any) => d.x).y((d: any) => d.y) as any);

    const node = svg.selectAll(".node")
      .data(treeRoot.descendants())
      .enter().append("g")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", (d: any) => d.data.isPositive ? 16 : 9)
      .attr("fill", (d: any) => d.data.isRevealed ? "#c90c14" : "#fff")
      .attr("stroke", (d: any) => d.data.isRevealed ? "#c90c14" : "#f1f5f9")
      .attr("stroke-width", 2);

    const textGroup = node.append("text")
      .attr("x", 25)
      .attr("text-anchor", "start")
      .attr("dy", "0.35em")
      .style("opacity", 0);

    textGroup.transition()
      .duration(700)
      .style("opacity", 1);

    // Línea 1: Cantidad Compacta (K/M)
    textGroup.append("tspan")
      .attr("x", 25)
      .attr("dy", "-0.8em")
      .text((d: any) => {
        if (!d.data.isRevealed || d.data.displayValue === '?') return "?";
        return d.data.displayValue;
      })
      .style("font-size", "22px")
      .style("font-weight", "900")
      .style("fill", (d: any) => d.data.isRevealed ? "#000" : "#e2e8f0");

    // Línea 2: Porcentaje
    textGroup.append("tspan")
      .attr("x", 25)
      .attr("dy", "1.2em")
      .text((d: any) => {
        if (!d.data.isRevealed || d.data.displayValue === '?' || !d.parent) return "";
        const perc = ((d.data.rawValue / d.parent.data.rawValue) * 100).toFixed(1);
        return `${perc}%`;
      })
      .style("font-size", "14px")
      .style("font-weight", "700")
      .style("fill", "#64748b");

    // Línea 3: Valor Monetario resaltado ($X M)
    textGroup.append("tspan")
      .attr("x", 25)
      .attr("dy", "1.2em")
      .text((d: any) => {
        if (!d.data.isRevealed || d.data.displayValue === '?') return "";
        return `$${formatCompact(d.data.monetaryValue)} M`;
      })
      .style("font-size", "16px")
      .style("font-weight", "800")
      .style("fill", "#334155"); // Gris oscuro para contraste con el rojo del nodo

    node.append("text")
      .attr("dy", "-3.2em")
      .attr("text-anchor", "middle")
      .text((d: any) => {
        if (d.data.logicalLevel >= 3) return ""; 
        if (d.data.name === "Segmento Único") return "";
        return d.data.name;
      })
      .style("font-size", "14px")
      .style("font-weight", "800")
      .style("fill", "#64748b")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "0.05em");

  }, [quiz, revealedQuestions]);

  return (
    <div className="w-full bg-white rounded-[80px] border border-slate-100 shadow-4xl overflow-hidden relative">
      <div className="absolute top-12 left-12 z-10">
         <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <div className="w-5 h-5 bg-[#c90c14] rounded-full shadow-sm"></div>
            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Jerarquía de Valor</span>
         </div>
      </div>
      <div className="p-10 bg-white flex justify-center items-center">
        <svg ref={svgRef} className="w-full h-auto max-h-[850px]"></svg>
      </div>
    </div>
  );
};

export default TreeChart;
