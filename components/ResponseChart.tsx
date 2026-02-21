
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Question, PlayerAnswer } from '../types';

interface ResponseChartProps {
  question: Question;
  answers: PlayerAnswer[];
  showCorrect: boolean;
}

const ResponseChart: React.FC<ResponseChartProps> = ({ question, answers, showCorrect }) => {
  const data = question.options.map((option, index) => ({
    name: String.fromCharCode(65 + index),
    fullName: option,
    count: answers.filter(a => a.optionIndex === index).length,
    isCorrect: index === question.correctIndex,
  }));

  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ display: 'none' }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
            {data.map((entry, index) => {
              const colors = ['#c90c14', '#1e293b', '#334155', '#475569'];
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={showCorrect ? (entry.isCorrect ? '#10b981' : '#cbd5e1') : colors[index % colors.length]} 
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseChart;
