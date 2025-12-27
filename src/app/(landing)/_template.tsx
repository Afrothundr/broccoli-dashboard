export default function Template({ children }: { children: React.ReactNode }) {
  return <div style={{ viewTransitionName: "page" }}>{children}</div>;
}
