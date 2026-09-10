import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwapPoint — новая история для каждой вещи",
  description: "Соседский маркетплейс обмена вещами за баллы",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
