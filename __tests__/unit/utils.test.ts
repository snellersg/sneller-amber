/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'

describe('Utility Functions', () => {
  describe('Example utility test', () => {
    it('should pass basic test', () => {
      expect(1 + 1).toBe(2)
    })

    it('should handle truthiness', () => {
      expect(true).toBeTruthy()
      expect(false).toBeFalsy()
    })
  })
})
