name: 🤖 xCloud Bot Integration

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */6 * * *'  # A cada 6 horas

jobs:
  bot-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: 🤖 Setup xCloud Bot
        run: |
          # Clone e configure o bot
          git clone https://github.com/PageCloudv1/xcloud-bot.git ../xcloud-bot
          cd ../xcloud-bot
          npm install
          npm run build
          
      - name: 📊 Analyze Repository
        run: |
          cd ../xcloud-bot
          npm run analyze:repo ${{ github.repository }}
          
      - name: 🔍 Monitor CI Status
        run: |
          cd ../xcloud-bot
          npm run scheduler:run
          
      - name: 🤖 Create Issues if Needed
        run: |
          cd ../xcloud-bot
          npm run create:issue ${{ github.repository }} "Automated Analysis Report"