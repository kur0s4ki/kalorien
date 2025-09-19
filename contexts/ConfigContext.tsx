'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getAppConfig } from '@/lib/supabase'

interface ConfigContextType {
  config: Record<string, string>
  loading: boolean
  refreshConfig: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextType>({
  config: {},
  loading: true,
  refreshConfig: async () => {}
})

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const loadConfig = async () => {
    try {
      const configData = await getAppConfig()
      setConfig(configData)
    } catch (error) {
      console.error('Error loading config:', error)
      // Set default values if loading fails
      setConfig({
        app_title: 'Calorie Expenditure Calculator',
        app_description: 'Educational calorie expenditure calculator. Results are estimates only and not medical advice. Consult healthcare professionals before making dietary changes.',
        assessment_title: 'Calorie Expenditure Assessment',
        assessment_description: 'Please fill in your information to get personalized health insights',
        results_title: 'Your Results',
        goal_title: 'Your Goals'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const refreshConfig = async () => {
    await loadConfig()
  }

  return (
    <ConfigContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}