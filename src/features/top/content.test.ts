import { describe, expect, it } from 'vitest'
import { HOW_TO_STEPS } from './content'

describe('HOW_TO_STEPS', () => {
  it('使い方は3ステップ', () => {
    expect(HOW_TO_STEPS).toHaveLength(3)
  })

  it('すべてのステップに、スクリーンショットの画像と代替テキストがある(仮画像が残っていない)', () => {
    HOW_TO_STEPS.forEach((step) => {
      expect(step.screenshot.src).not.toBeNull()
      expect(step.screenshot.alt).toContain('スクリーンショット')
      expect(step.screenshot.alt.length).toBeGreaterThan(20)
    })
  })

  it('3枚とも、別の画像', () => {
    const sources = HOW_TO_STEPS.map((step) => step.screenshot.src)

    expect(new Set(sources).size).toBe(3)
  })
})