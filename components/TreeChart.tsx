
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

    const width = 1600;
    const height = 900; // Un poco más de altura para acomodar las 2 líneas cómodamente
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
    const isQ4Done = revealedQuestions.includes(3);
    const isQ5Done = revealedQuestions.includes(4);
    const isQ6Done = revealedQuestions.includes(5);

    const checkIsPositive = (name: string) => {
      const negatives = ["Inactivo", "Inactivos", "No Principal", "No Activos", "No Principal"];
      return !negatives.includes(name);
    };

    const buildTreeData = () => {
      const root = { 
        name: quiz.initialLabel, 
        rawValue: quiz.initialTotal,
        monetaryValue: quiz.initialMonetaryTotal || 0,
        displayValue: quiz.initialTotal.toLocaleString(),
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
            displayValue: isQ1Done ? quiz.questions[0].optionValues[idx].toLocaleString() : '?',
            isRevealed: isQ1Done,
            isPositive: checkIsPositive(label),
            logicalLevel: 1,
            children: [] as any[]
          };

          if (label === "Empresariales") {
            const bridgeNode = {
              name: "Segmento Único",
              rawValue: node.rawValue,
              monetaryValue: node.monetaryValue,
              displayValue: node.displayValue,
              isRevealed: isQ1Done,
              isPositive: true,
              logicalLevel: 2,
              children: [] as any[]
            };
            node.children = [bridgeNode];

            if (isQ4Done) {
              const comp = HIERARCHY_MAP["Empresariales"];
              bridgeNode.children = comp.labels.map((actLabel: string, actIdx: number) => {
                const actNode: any = {
                  name: actLabel,
                  rawValue: comp.values[actIdx],
                  monetaryValue: comp.monetary[actIdx],
                  displayValue: comp.values[actIdx].toLocaleString(),
                  isRevealed: true,
                  isPositive: checkIsPositive(actLabel),
                  logicalLevel: 3,
                  children: []
                };
                
                if (actLabel === "Activos" && isQ6Done) {
                  const pValues = comp.principality;
                  const mValues = comp.principalityMonetary;
                  actNode.children = ["Principal", "No Principal"].map((prinLabel, pIdx) => ({
                    name: prinLabel,
                    rawValue: pValues[pIdx],
                    monetaryValue: mValues[pIdx],
                    displayValue: pValues[pIdx].toLocaleString(),
                    isRevealed: true,
                    isPositive: checkIsPositive(prinLabel),
                    logicalLevel: 4,
                    children: []
                  }));
                }
                return actNode;
              });
            }
          }

          if (label === "Personas" && isQ2Done) {
            const q2 = quiz.questions[1];
            node.children = q2.optionLabels.map((pLabel, pIdx) => {
              const pNode: any = {
                name: pLabel,
                rawValue: q2.optionValues[pIdx],
                monetaryValue: q2.optionMonetaryValues ? q2.optionMonetaryValues[pIdx] : 0,
                displayValue: q2.optionValues[pIdx].toLocaleString(),
                isRevealed: true,
                isPositive: checkIsPositive(pLabel),
                logicalLevel: 2,
                children: [] as any[]
              };

              if (isQ3Done || isQ4Done || isQ5Done) {
                let actData: any;
                if (pLabel === "Exclusivos DVP") {
                  actData = { 
                    labels: ["Activos", "Inactivos"], 
                    values: quiz.questions[2].optionValues, 
                    monetary: quiz.questions[2].optionMonetaryValues,
                    principality: quiz.questions[4].optionValues,
                    principalityMonetary: quiz.questions[4].optionMonetaryValues
                  };
                } else {
                  actData = HIERARCHY_MAP[pLabel];
                }

                if (actData) {
                  pNode.children = actData.labels.map((actLabel: string, actIdx: number) => {
                    const actNode: any = {
                      name: actLabel,
                      rawValue: actData.values[actIdx],
                      monetaryValue: actData.monetary[actIdx],
                      displayValue: actData.values[actIdx].toLocaleString(),
                      isRevealed: true,
                      isPositive: checkIsPositive(actLabel),
                      logicalLevel: 3,
                      children: []
                    };

                    if (actLabel === "Activos" && isQ5Done) {
                      const pValues = actData.principality;
                      const mValues = actData.principalityMonetary;
                      actNode.children = ["Principal", "No Principal"].map((prinLabel, prinIdx) => ({
                        name: prinLabel,
                        rawValue: pValues[prinIdx],
                        monetaryValue: mValues[prinIdx],
                        displayValue: pValues[prinIdx].toLocaleString(),
                        isRevealed: true,
                        isPositive: checkIsPositive(prinLabel),
                        logicalLevel: 4,
                        children: []
                      }));
                    }
                    return actNode;
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

    const levelHeight = (height - margin.top - margin.bottom) / 4;
    treeRoot.each((d: any) => {
      d.y = d.data.logicalLevel * levelHeight;
    });

    // Labels de Niveles
    const levelLabels = ["POBLACIÓN", "SEGMENTO", "RELACION", "ACTIVIDAD", "PRINCIPALIDAD"];
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

    // Conclusiones
    const conclusions = [
      { level: 3, text: "La reactivación de inactivos representa un 15% de crecimiento potencial en volumen transaccional.", revealed: isQ3Done || isQ4Done },
      { level: 4, text: "Consolidar el estado de Principalidad impacta un +22% en el Lifetime Value del cliente.", revealed: isQ5Done || isQ6Done }
    ];

    const conclusionGroup = svg.selectAll(".conclusion-box")
      .data(conclusions)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${width - margin.left - 300}, ${d.level * levelHeight - 30})`)
      .style("opacity", d => d.revealed ? 1 : 0);

    conclusionGroup.append("rect")
      .attr("width", 260)
      .attr("height", 80)
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
      .attr("width", 230)
      .attr("height", 60);

    foreignObject.append("xhtml:div")
      .style("font-size", "11px")
      .style("color", "#64748b")
      .style("font-weight", "600")
      .style("line-height", "1.3")
      .html(d => d.text);

    // Enlaces
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

    // Bloque de texto de datos
    const textGroup = node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d: any) => d.data.isPositive ? "2.6em" : "2.4em")
      .style("opacity", 0);

    textGroup.transition()
      .duration(700)
      .style("opacity", 1);

    // Línea 1: Cantidad + Porcentaje
    textGroup.append("tspan")
      .attr("x", 0)
      .attr("dy", "0em")
      .text((d: any) => {
        if (!d.data.isRevealed || d.data.displayValue === '?') return "?";
        const valStr = d.data.displayValue;
        if (!d.parent) return valStr;
        const perc = ((d.data.rawValue / d.parent.data.rawValue) * 100).toFixed(1);
        return `${valStr} (${perc}%)`;
      })
      .style("font-size", "22px")
      .style("font-weight", "900")
      .style("fill", (d: any) => d.data.isRevealed ? "#000" : "#e2e8f0");

    // Línea 2: Valor Monetario ($M)
    textGroup.append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .text((d: any) => {
        if (!d.data.isRevealed || d.data.displayValue === '?') return "";
        return `$${d.data.monetaryValue.toLocaleString()}M Margen`;
      })
      .style("font-size", "15px")
      .style("font-weight", "700")
      .style("fill", "#64748b");

    // Nombre del Nodo
    node.append("text")
      .attr("dy", "-2.2em")
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
            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Segmento Estratégico</span>
         </div>
      </div>
      <div className="p-10 bg-white flex justify-center items-center">
        <svg ref={svgRef} className="w-full h-auto max-h-[850px]"></svg>
      </div>
    </div>
  );
};

export default TreeChart;
