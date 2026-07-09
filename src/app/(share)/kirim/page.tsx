import { redirect } from "next/navigation";

import { ShareSend } from "@/components/templates/share-send";
import { shareBouncePath } from "@/server/share-resolve";
import { getShareSendData } from "@/server/queries/share";

export default async function Page() {
  const data = await getShareSendData();
  if (!data) {
    redirect(await shareBouncePath());
  }
  return <ShareSend data={data} />;
}
