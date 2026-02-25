'use client'

import { Suspense } from "react";

const Main = () => {
  return <div className="text-muted-foreground">Test page</div>;
};

const App = () => (
<Suspense fallback={"Loading..."}>
    <Main />
</Suspense>
); 

export default App;