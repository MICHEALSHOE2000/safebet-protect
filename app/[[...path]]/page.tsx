import Protect from "../../components/protect";
import Home from "../../components/public/home";
export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path } = await params;
  return !path?.length ? <Home /> : <Protect />;
}
