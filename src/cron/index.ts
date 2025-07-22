import cron from 'node-cron'
import unlockExpiredSeats from '../tasks/unlockSeats'

cron.schedule('*/20 * * * *', async () => {
  console.log('⏰ Running seat unlock task...')
  await unlockExpiredSeats()
})
