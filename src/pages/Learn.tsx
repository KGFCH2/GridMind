import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, Info, Lightbulb, Target } from 'lucide-react';

export default function Learn() {
  const strategies = [
    {
      title: "Single Candidate",
      desc: "The most basic strategy. If a cell has only one possible number that can be placed without violating Sudoku rules, that number must be the solution for that cell.",
      icon: <Target className="w-8 h-8 text-primary" />,
      difficulty: "Beginner"
    },
    {
      title: "Hidden Single",
      desc: "If a number can only be placed in one cell within a specific row, column, or subgrid, then it must be placed there, even if that cell has other candidates.",
      icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
      difficulty: "Beginner"
    },
    {
      title: "Naked Pairs",
      desc: "If two cells in a unit (row, col, or box) contain the exact same two candidates, those two numbers can be eliminated from all other cells in that unit.",
      icon: <CheckCircle2 className="w-8 h-8 text-blue-500" />,
      difficulty: "Intermediate"
    },
    {
      title: "Pointing Pairs",
      desc: "If a candidate number appears only in a single row or column within a subgrid, that number must be in one of those cells. Therefore, it can be removed from the rest of that row or column outside the subgrid.",
      icon: <Info className="w-8 h-8 text-purple-500" />,
      difficulty: "Intermediate"
    },
    {
      title: "X-Wing",
      desc: "A more advanced technique. If a candidate appears exactly twice in two different rows, and those occurrences align in the same two columns, that candidate can be removed from those columns in all other rows.",
      icon: <BookOpen className="w-8 h-8 text-red-500" />,
      difficulty: "Advanced"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <section className="text-center space-y-4 bg-stone-900 dark:bg-stone-900/50 p-6 rounded-[40px] text-white transition-colors duration-500">
        <h1 className="text-5xl font-black tracking-tighter transition-colors duration-500">
          <span className="text-primary">MASTER</span> <span className="text-white">THE</span> <span className="text-primary">GRID</span>
        </h1>
        <p className="text-xl text-stone-400 font-medium transition-colors duration-500">Learn the strategies used by grandmasters and our AI solver.</p>
      </section>

      <div className="grid gap-4">
        {strategies.map((strategy, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-stone-900 p-4 rounded-4xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row gap-8 items-start hover:shadow-2xl hover:shadow-stone-100 dark:hover:shadow-stone-950 transition-all duration-500 hover:border-primary hover:-translate-y-1"
          >
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-2xl shrink-0">
              {strategy.icon}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 transition-colors duration-500">{strategy.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  strategy.difficulty === 'Advanced' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' :
                  strategy.difficulty === 'Intermediate' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'
                }`}>
                  {strategy.difficulty}
                </span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed font-medium text-lg transition-colors duration-500">
                {strategy.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-stone-900 dark:bg-secondary/20 rounded-[40px] p-6 text-center space-y-8 border border-transparent dark:border-secondary/40 transition-colors duration-500">
        <h2 className="text-3xl font-bold text-white dark:text-secondary">Ready to test your knowledge?</h2>
        <p className="text-stone-400 dark:text-secondary/80 text-lg max-w-xl mx-auto">
          Head over to the solver and try to identify these patterns as you solve or watch the AI animate.
        </p>
        <a
          href="/solver"
          className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-stone-900 transition-all shadow-lg shadow-primary/20 dark:shadow-stone-950"
        >
          Go to Solver
        </a>
      </section>
    </div>
  );
}
