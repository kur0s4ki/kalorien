'use client'

import { useConfig } from '@/contexts/ConfigContext'

export default function Head() {
  const { config, loading } = useConfig()

  if (loading) {
    return (
      <>
        <title>Loading...</title>
        <meta name="description" content="Loading application..." />
      </>
    )
  }

  return (
    <>
      <title>{config.app_title || 'Calorie Expenditure Calculator'}</title>
      <meta
        name="description"
        content={config.app_description || 'Educational calorie expenditure calculator. Results are estimates only and not medical advice. Consult healthcare professionals before making dietary changes.'}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </>
  )
}