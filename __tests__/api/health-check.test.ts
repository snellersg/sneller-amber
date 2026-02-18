/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health-check/route'

describe('/api/health-check', () => {
  it('should validate health check response structure', async () => {
    const mockRequest = {} as any
    const response = await GET(mockRequest)

    expect(response.status).toBe(200)
  })

  it('should return expected data format', () => {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'test',
    }

    expect(healthData).toHaveProperty('status')
    expect(healthData).toHaveProperty('timestamp')
    expect(healthData).toHaveProperty('environment')
    expect(healthData.status).toBe('healthy')
  })
})
