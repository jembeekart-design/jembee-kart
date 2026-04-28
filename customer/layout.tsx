import ConfigProvider from "@/shared/config/configProvider"

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}
