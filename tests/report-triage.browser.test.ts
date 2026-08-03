import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('analyst submits, investigates, and confirms a phishing report, then filters the queue', async ({
  page,
}) => {
  await page.getByLabel('Sender').fill('IT Support <helpdesk@company-verify.example>')
  await page.getByLabel('Subject').fill('Your password expires today')
  await page.getByLabel('Date received').fill('2026-08-01')
  await page.getByRole('button', { name: 'Report email' }).click()

  await expect(page.getByText('Your password expires today')).toBeVisible()
  await expect(page.locator('.status', { hasText: 'New' })).toBeVisible()

  await page
    .getByRole('button', { name: 'Mark as Investigating: Your password expires today' })
    .click()
  await expect(page.locator('.status', { hasText: 'Investigating' })).toBeVisible()

  await page
    .getByRole('button', { name: 'Mark as Phishing: Your password expires today' })
    .click()
  await expect(page.locator('.status', { hasText: 'Phishing' })).toBeVisible()

  await page.getByRole('button', { name: 'New', exact: true }).click()
  await expect(page.getByText('No reports match this filter.')).toBeVisible()

  await page.getByRole('button', { name: 'Phishing', exact: true }).click()
  await expect(page.getByText('Your password expires today')).toBeVisible()
})

test('data survives refresh, a report cannot skip the investigation step, and filters work from the keyboard', async ({
  page,
}) => {
  await page.getByLabel('Sender').fill('billing@paypal-secure-verify.example')
  await page.getByLabel('Subject').fill('Confirm your account')
  await page.getByLabel('Date received').fill('2026-08-01')
  await page.getByRole('button', { name: 'Report email' }).click()
  await page.reload()

  await expect(page.getByText('Confirm your account')).toBeVisible()
  await expect(page.getByRole('button', { name: /Mark as Phishing/ })).toHaveCount(0)

  const investigatingFilter = page.getByRole('button', { name: 'Investigating', exact: true })
  await investigatingFilter.focus()
  await page.keyboard.press('Enter')
  await expect(investigatingFilter).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('No reports match this filter.')).toBeVisible()

  await page.getByRole('button', { name: 'All', exact: true }).click()
  const investigateButton = page.getByRole('button', { name: /Mark as Investigating/ })
  await investigateButton.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /Mark as Phishing/ })).toBeVisible()
})

test('report content renders as text, never as executable markup (stored-XSS safety net)', async ({
  page,
}) => {
  const senderPayload = '<img src=x onerror="window.hacked=true">'
  const subjectPayload = '<script>window.hacked=true</script>Urgent: verify now'
  const notePayload = '<b>bold</b> looked wrong to me'

  await page.getByLabel('Sender').fill(senderPayload)
  await page.getByLabel('Subject').fill(subjectPayload)
  await page.getByLabel('Date received').fill('2026-08-01')
  await page.getByLabel('Note (optional)').fill(notePayload)
  await page.getByRole('button', { name: 'Report email' }).click()

  await expect(page.getByText(senderPayload)).toBeVisible()
  await expect(page.getByText(subjectPayload, { exact: true })).toBeVisible()
  await expect(page.getByText(notePayload, { exact: true })).toBeVisible()
  await expect(page.locator('img')).toHaveCount(0)
  await expect(page.evaluate(() => 'hacked' in window)).resolves.toBe(false)
})
