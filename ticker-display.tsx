"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Trash2, Plus } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts"

interface Asset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  volumeChange24h: number
  priceHistory: { price: number; time: string }[]
  high24h: number
  low24h: number
  totalSupply: number
  type: "stock" | "etf" | "crypto"
}

const generateRealisticMockData = (basePrice: number, volatility = 0.05, trend = 0.01) => {
  let currentPrice = basePrice
  const now = Date.now()
  return Array.from({ length: 30 }, (_, i) => {
    const randomFactor = Math.random() * 2 - 1 // Range from -1 to 1
    const trendFactor = Math.random() * 0.5 + 0.75 // 0.75 to 1.25, slightly biased towards positive
    const randomChange = (randomFactor * volatility + trend * trendFactor) * currentPrice
    currentPrice += randomChange
    currentPrice = Math.max(currentPrice, basePrice * 0.9) // Prevent price from going too low
    currentPrice = Math.min(currentPrice, basePrice * 1.1) // Prevent price from going too high
    const time = new Date(now - (29 - i) * 5 * 60 * 1000) // 5-minute intervals
    return {
      price: currentPrice,
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  })
}

const initialAssets: Asset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 97845.0,
    change24h: 3.5,
    marketCap: 1920000000000,
    volume24h: 40000000000,
    volumeChange24h: 4.2,
    priceHistory: generateRealisticMockData(97845.0, 0.1, 0.03),
    high24h: 99000.0,
    low24h: 96000.0,
    totalSupply: 21000000,
    type: "crypto",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 5230.0,
    change24h: 2.8,
    marketCap: 630000000000,
    volume24h: 20000000000,
    volumeChange24h: 3.1,
    priceHistory: generateRealisticMockData(5230.0, 0.09, 0.025),
    high24h: 5350.0,
    low24h: 5150.0,
    totalSupply: 120000000,
    type: "crypto",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 185.5,
    change24h: 4.2,
    marketCap: 80000000000,
    volume24h: 5000000000,
    volumeChange24h: 5.5,
    priceHistory: generateRealisticMockData(185.5, 0.12, 0.035),
    high24h: 190.0,
    low24h: 180.0,
    totalSupply: 549846983,
    type: "crypto",
  },
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.2,
    change24h: 1.5,
    marketCap: 2750000000000,
    volume24h: 55000000,
    volumeChange24h: 2.2,
    priceHistory: generateRealisticMockData(175.2, 0.04, 0.015),
    high24h: 177.5,
    low24h: 174.0,
    totalSupply: 16000000000,
    type: "stock",
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 152.5,
    change24h: 1.8,
    marketCap: 1920000000000,
    volume24h: 35000000,
    volumeChange24h: 2.5,
    priceHistory: generateRealisticMockData(152.5, 0.05, 0.02),
    high24h: 154.0,
    low24h: 151.0,
    totalSupply: 6600000000,
    type: "stock",
  },
  {
    id: "qqq",
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    price: 430.5,
    change24h: 1.6,
    marketCap: 230000000000,
    volume24h: 88000000,
    volumeChange24h: 2.3,
    priceHistory: generateRealisticMockData(430.5, 0.03, 0.01),
    high24h: 433.0,
    low24h: 428.0,
    totalSupply: 530000000,
    type: "etf",
  },
  {
    id: "spy",
    symbol: "SPY",
    name: "SPDR S&P 500 ETF",
    price: 505.2,
    change24h: 1.2,
    marketCap: 455000000000,
    volume24h: 110000000,
    volumeChange24h: 1.8,
    priceHistory: generateRealisticMockData(505.2, 0.02, 0.008),
    high24h: 508.8,
    low24h: 503.5,
    totalSupply: 950000000,
    type: "etf",
  },
]

const getBorderColor = (change: number) => {
  const absChange = Math.abs(change)
  if (change >= 0) {
    if (absChange >= 5) return "border-green-500"
    if (absChange >= 2) return "border-green-400"
    return "border-green-300"
  } else {
    if (absChange >= 5) return "border-red-500"
    if (absChange >= 2) return "border-red-400"
    return "border-red-300"
  }
}

const getGlowColor = (change: number) => {
  if (change >= 0) {
    return "shadow-[0_0_15px_rgba(34,197,94,0.5)]" // green glow
  } else {
    return "shadow-[0_0_15px_rgba(239,68,68,0.5)]" // red glow
  }
}

const getBorderWidth = (change: number) => {
  const absChange = Math.abs(change)
  if (absChange >= 5) return "border-4 hover:border-[6px]"
  if (absChange >= 2) return "border-2 hover:border-[4px]"
  return "border hover:border-2"
}

const simulatePriceChange = (asset: Asset): Asset => {
  const volatility = 0.003 // 0.3% volatility
  const trend = 0.0005 // 0.05% trend
  const randomFactor = Math.random() * 2 - 1 // Range from -1 to 1
  const trendFactor = Math.random() * 0.5 + 0.75 // 0.75 to 1.25, slightly biased towards positive
  const randomChange = (randomFactor * volatility + trend * trendFactor) * asset.price
  const newPrice = asset.price + randomChange
  const newChange24h = (newPrice / asset.priceHistory[0].price - 1) * 100

  const now = new Date()
  const newPricePoint = {
    price: newPrice,
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }

  return {
    ...asset,
    price: newPrice,
    change24h: newChange24h,
    priceHistory: [...asset.priceHistory.slice(1), newPricePoint],
    high24h: Math.max(asset.high24h, newPrice),
    low24h: Math.min(asset.low24h, newPrice),
  }
}

const CardFront = React.memo(({ asset, displayPrice }: { asset: Asset; displayPrice: number }) => (
  <motion.div
    key="front"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="absolute inset-0 p-5 flex flex-col justify-between backface-hidden"
  >
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text">
          {asset.symbol}
        </h2>
        <p className="text-sm text-gray-400 font-medium truncate">{asset.name}</p>
      </div>
      <div className={`flex items-center ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"} font-semibold`}>
        {asset.change24h >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
        <span className="ml-1 text-lg">{asset.change24h.toFixed(2)}%</span>
      </div>
    </div>
    <div className="flex justify-between items-end">
      <div className="w-32 h-16 group-hover:opacity-75 transition-opacity duration-300 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={asset.priceHistory}>
            <Line
              type="monotone"
              dataKey="price"
              stroke={asset.change24h >= 0 ? "#4ade80" : "#f87171"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <YAxis domain={["dataMin", "dataMax"]} hide={true} />
            <Tooltip
              position={{ y: 0 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-lg absolute left-0 bottom-full mb-2">
                      <p className="text-white text-xs">${payload[0].value.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">{payload[0].payload.time}</p>
                    </div>
                  )
                }
                return null
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-3xl font-bold text-white drop-shadow-glow transition-all duration-300">
        ${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  </motion.div>
))

const CardBack = React.memo(({ asset, onDelete }: { asset: Asset; onDelete: () => void }) => (
  <motion.div
    key="back"
    initial={{ opacity: 0, rotateY: 180 }}
    animate={{ opacity: 1, rotateY: 180 }}
    exit={{ opacity: 0, rotateY: 180 }}
    transition={{ duration: 0.2 }}
    className="absolute inset-0 p-4 flex flex-col backface-hidden [transform:rotateY(180deg)]"
  >
    <div className="flex flex-col justify-between items-center h-full text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-teal-400 text-transparent bg-clip-text leading-tight">
          {asset.name}
        </h3>
        <p className="text-sm text-gray-400">({asset.symbol})</p>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs w-full">
        <p className="text-gray-300">
          Market Cap: <span className="font-medium text-teal-400">${(asset.marketCap / 1e9).toFixed(2)}B</span>
        </p>
        <p className="text-gray-300">
          24h Volume: <span className="font-medium text-blue-400">${(asset.volume24h / 1e9).toFixed(2)}B</span>
        </p>
        <p className="text-gray-300">
          24h High:{" "}
          <span className="font-medium text-green-400">
            ${asset.high24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
        <p className="text-gray-300">
          24h Low:{" "}
          <span className="font-medium text-red-400">
            ${asset.low24h.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
        <p className="text-gray-300 col-span-2">
          Total Supply: <span className="font-medium text-yellow-400">{asset.totalSupply.toLocaleString()}</span>
        </p>
        <p className="text-gray-300 col-span-2">
          Volume Change (24h):{" "}
          <span className={`font-medium ${asset.volumeChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
            {asset.volumeChange24h.toFixed(2)}%
          </span>
        </p>
      </div>
      <div className="flex justify-between items-center w-full">
        <p className="text-xl font-bold text-white">
          ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Delete ${asset.name} from watchlist`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
))

const AssetCard = React.memo(
  ({
    asset,
    isFlipped,
    onFlip,
    onDelete,
  }: {
    asset: Asset
    isFlipped: boolean
    onFlip: () => void
    onDelete: () => void
  }) => {
    const [displayPrice, setDisplayPrice] = useState(asset.price)

    useEffect(() => {
      const timer = setTimeout(() => {
        setDisplayPrice(asset.price)
      }, 300) // Slight delay for smooth transition

      return () => clearTimeout(timer)
    }, [asset.price])

    return (
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="perspective-1000"
      >
        <Card
          className={`relative w-full h-52 cursor-pointer transform-style-3d transition-all duration-300 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden hover:shadow-2xl hover:scale-105 hover:z-10 group ${
            asset.change24h >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          } ${getBorderColor(asset.change24h)} ${getBorderWidth(asset.change24h)} ${getGlowColor(asset.change24h)} neon-flicker hover:border-black`}
          onClick={onFlip}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-teal-500/5 group-hover:via-blue-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
          <AnimatePresence initial={false}>
            {!isFlipped ? (
              <CardFront asset={asset} displayPrice={displayPrice} />
            ) : (
              <CardBack asset={asset} onDelete={onDelete} />
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    )
  },
)

export default function TickerDisplay() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [isAddingTicker, setIsAddingTicker] = useState(false)
  const [newTickerSymbol, setNewTickerSymbol] = useState("")

  const handleCardClick = (id: string) => {
    setFlippedCards((prevFlipped) => {
      const newFlipped = new Set(prevFlipped)
      if (newFlipped.has(id)) {
        newFlipped.delete(id)
      } else {
        newFlipped.add(id)
      }
      return newFlipped
    })
  }

  const handleAddTicker = () => {
    if (newTickerSymbol.trim() === "") return

    const type: "stock" | "etf" | "crypto" = Math.random() > 0.7 ? "crypto" : Math.random() > 0.5 ? "stock" : "etf"
    const basePrice = 100 + Math.random() * 900
    const volatility = type === "crypto" ? 0.08 : type === "stock" ? 0.04 : 0.02
    const trend = type === "crypto" ? 0.02 : type === "stock" ? 0.01 : 0.005
    const newAsset: Asset = {
      id: newTickerSymbol.toLowerCase(),
      symbol: newTickerSymbol.toUpperCase(),
      name: `${newTickerSymbol.toUpperCase()} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      price: basePrice,
      change24h: Math.random() * 10 - 5, // Range from -5% to 5%
      marketCap: 1000000000 + Math.random() * 9000000000,
      volume24h: 10000000 + Math.random() * 90000000,
      volumeChange24h: Math.random() * 20 - 10, // Range from -10% to 10%
      priceHistory: generateRealisticMockData(basePrice, volatility, trend),
      high24h: basePrice * (1 + Math.random() * 0.05),
      low24h: basePrice * (1 - Math.random() * 0.05),
      totalSupply: 1000000 + Math.random() * 9000000,
      type: type,
    }
    setAssets((prevAssets) => [...prevAssets, newAsset])
    setIsAddingTicker(false)
    setNewTickerSymbol("")
  }

  const handleDeleteAsset = (id: string) => {
    setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id))
    setFlippedCards((prevFlipped) => {
      const newFlipped = new Set(prevFlipped)
      newFlipped.delete(id)
      return newFlipped
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) => prevAssets.map((asset) => simulatePriceChange(asset)))
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 text-transparent bg-clip-text">
          TKR Pro: Real-Time Market Tracker
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-7xl">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isFlipped={flippedCards.has(asset.id)}
            onFlip={() => handleCardClick(asset.id)}
            onDelete={() => handleDeleteAsset(asset.id)}
          />
        ))}
        {isAddingTicker ? (
          <Card className="relative w-full h-52 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 overflow-hidden shadow-xl group border flex flex-col items-center justify-center p-4">
            <input
              type="text"
              value={newTickerSymbol}
              onChange={(e) => setNewTickerSymbol(e.target.value)}
              placeholder="Enter ticker symbol"
              className="w-full p-2 mb-4 bg-gray-700 text-white border border-gray-600 rounded"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddTicker}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsAddingTicker(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </Card>
        ) : (
          <Card
            className="relative w-full h-52 cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-600 overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 hover:z-10 group border border-gray-700 flex items-center justify-center"
            onClick={() => setIsAddingTicker(true)}
          >
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-2 text-gray-400 group-hover:text-blue-400 transition-colors" />
              <p className="text-lg font-semibold text-gray-300 group-hover:text-blue-300 transition-colors">
                Add New Ticker
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
