'use client'

import { useState } from 'react'
import { Calculator, RotateCcw } from 'lucide-react'
import Layout from '../../components/Layout'

export default function ToolsPage() {
  // Mulch Calculator States
  const [mulchArea, setMulchArea] = useState('')
  const [mulchDepth, setMulchDepth] = useState('')
  const [mulchResult, setMulchResult] = useState<string | null>(null)

  // Stone Calculator States
  const [stoneArea, setStoneArea] = useState('')
  const [stoneDepth, setStoneDepth] = useState('')
  const [stoneMaterial, setStoneMaterial] = useState('Peastone')
  const [stoneResult, setStoneResult] = useState<string | null>(null)

  const stoneDensities = {
    'Peastone': { density: 100, waste: 1.1 },
    '3/8" - 1" MI Stone': { density: 105, waste: 1.1 },
    '1" Crushed MI Stone': { density: 100, waste: 1.08 },
    '1-3" MI Stone': { density: 110, waste: 1.07 },
    '2-4" MI Stone': { density: 110, waste: 1.06 },
  }

  const calculateMulch = () => {
    if (!mulchArea || !mulchDepth) return
    const cubicFeet = parseFloat(mulchArea) * (parseFloat(mulchDepth) / 12)
    const cubicYards = cubicFeet / 27
    setMulchResult(cubicYards.toFixed(2))
  }

  const calculateStone = () => {
    if (!stoneArea || !stoneDepth) return
    const material = stoneDensities[stoneMaterial as keyof typeof stoneDensities]
    const volumeCubicFeet = parseFloat(stoneArea) * (parseFloat(stoneDepth) / 12)
    const volumeCubicYards = (volumeCubicFeet / 27) * material.waste
    setStoneResult(volumeCubicYards.toFixed(2))
  }

  const clearMulchCalculator = () => {
    setMulchArea('')
    setMulchDepth('')
    setMulchResult(null)
  }

  const clearStoneCalculator = () => {
    setStoneArea('')
    setStoneDepth('')
    setStoneMaterial('Peastone')
    setStoneResult(null)
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Estimating Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Professional calculators for accurate material estimates
          </p>
        </div>

        {/* Calculators Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mulch Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white uppercase mb-2">
                <Calculator className="h-5 w-5" />
                Mulch Calculator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Calculate cubic yards needed</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="mulch-area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coverage Area
                  </label>
                  <div className="relative">
                    <input
                      id="mulch-area"
                      type="number"
                      value={mulchArea}
                      onChange={(e) => setMulchArea(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400">
                      sq ft
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="mulch-depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Depth
                  </label>
                  <div className="relative">
                    <input
                      id="mulch-depth"
                      type="number"
                      value={mulchDepth}
                      onChange={(e) => setMulchDepth(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400">
                      inches
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={calculateMulch}
                  disabled={!mulchArea || !mulchDepth}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Volume
                </button>
                <button
                  onClick={clearMulchCalculator}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              
              {mulchResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium text-green-800 dark:text-green-200">
                      Result: {mulchResult} cubic yards
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Recommended mulch quantity needed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stone Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white uppercase mb-2">
                <Calculator className="h-5 w-5" />
                Stone Calculator
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Calculate with waste factor</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stone-area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Coverage Area
                  </label>
                  <div className="relative">
                    <input
                      id="stone-area"
                      type="number"
                      value={stoneArea}
                      onChange={(e) => setStoneArea(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400">
                      sq ft
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="stone-depth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Application Depth
                  </label>
                  <div className="relative">
                    <input
                      id="stone-depth"
                      type="number"
                      value={stoneDepth}
                      onChange={(e) => setStoneDepth(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500 dark:text-gray-400">
                      inches
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="stone-material" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stone Material Type
                </label>
                <select
                  id="stone-material"
                  value={stoneMaterial}
                  onChange={(e) => setStoneMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.keys(stoneDensities).map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Waste factor: {stoneDensities[stoneMaterial as keyof typeof stoneDensities]?.waste}x included
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={calculateStone}
                  disabled={!stoneArea || !stoneDepth}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate Volume
                </button>
                <button
                  onClick={clearStoneCalculator}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              
              {stoneResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <h3 className="font-medium text-green-800 dark:text-green-200">
                      Result: {stoneResult} cubic yards
                    </h3>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Includes {stoneDensities[stoneMaterial as keyof typeof stoneDensities]?.waste}x waste factor
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tips Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase mb-4">
            Calculation Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Mulch Depth:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1 inch for annual bed refreshments
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Stone Applications:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Waste factors account for settling
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Coverage Planning:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Measure areas accurately
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Material Selection:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose based on project needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}