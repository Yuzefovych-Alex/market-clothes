import { Suspense } from "react";
import Menu from "./components/Menu/Menu";
import ListGoods from "./components/ListGoods/ListGoods";
import Footer from "./components/Footer/Footer";

export default function Home() {
  return (
    <div className="home">
      <div className="home__container">
        <div className="home__main">
          <Suspense
            fallback={
              <p style={{ padding: "1rem", fontSize: "0.85rem" }}>Загрузка…</p>
            }
          >
            <ListGoods />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <Menu />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
