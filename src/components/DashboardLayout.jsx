// import { motion } from 'framer-motion';

// export default function DashboardLayout({ title, subtitle, children, showHeader = true }) {
//   return (
//     <div className="min-h-screen w-full bg-gray-50 px-2 py-4 sm:px-6 lg:px-2">
//       {/* <div className="w-full px-2 sm:px-4 lg:px-6"></div> */}
//       <div className="w-full">
//         {showHeader && (
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mb-1"
//           >
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//               <div>
//                 <h1 className="text-3xl sm:text-4xl font-extrabold text-medical-dark">{title}</h1>
//                 <p className="mt-1 text-gray-600 max-w-2xl text-sm sm:text-base">{subtitle}</p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <div className="space-y-8">{children}</div>
//       </div>
//     </div>
//   );
// }


import { motion } from 'framer-motion';

export default function DashboardLayout({ title, subtitle, children, showHeader = true }) {
  return (
    <div className="min-h-screen w-full bg-gray-50 px-2 py-4 sm:px-4 lg:px-4">
      {/* Changed max-w-8xl mx-auto to w-full */}
      <div className="w-[calc(100%-2rem)] mx-4">


        {showHeader && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-1"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-medical-dark">{title}</h1>
                <p className="mt-1 text-gray-600 max-w-2xl text-sm sm:text-base">{subtitle}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}