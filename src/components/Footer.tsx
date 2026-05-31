import data from "../../package.json";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-neutral-900 w-full mt-auto border-t border-neutral-200 dark:border-neutral-800 transition-colors py-3 sm:py-4">
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 max-w-7xl mx-auto gap-2 sm:gap-3">
        <div className="flex text-center md:text-left select-none">
          <span className="font-semibold text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-tight">
            I.C.A.T - Inventory Counting Assistance Tool <span className="text-blue-600 dark:text-blue-400 font-medium">v{data.version}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
