import React, { useCallback } from "react";
import { CallAppBuilder, useScheme } from "deepLink-toolkit";

const App: React.FC<{}> = (props) => {
  const openMarket = useCallback(() => {
    new CallAppBuilder({
      PcFallbackUrl: "https://weixin.qq.com/",
      AndroidFallbackUrl:
        "https://play.google.com/store/apps/details?id=com.tencent.mm",
      IosFallbackUrl:
        "https://apps.apple.com/cn/app/%E5%BE%AE%E4%BF%A1/id414478124",
    })
      .setIntent({
        HOST: "details",
        packageName: "com.android.vending",
        scheme: "market",
        query: {
          id: "com.tencent.mm",
        },
        extras: {},
        browser_fallback_url:
          "https://play.google.com/store/apps/details?id=com.tencent.mm",
      })
      .setScheme({
        scheme: "market",
        host: "details",
        query: {
          id: "com.tencent.mm",
        },
      })
      .setScheme({
        scheme: "itms-apps",
        host: "itunes.apple.com",
        path: "/cn/app/微信/id414478124",
      })
      .execute();
  }, []);
  return (
    <div>
      <button onClick={openMarket}>open market</button>
    </div>
  );
};

export default App;
