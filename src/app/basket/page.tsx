import BasketContent from "../components/BasketContent/BasketContent";
import Footer from "../components/Footer/Footer";
import HeaderBasket from "../components/HeaderBasket/HeaderBasket";

export default function Basket() {
  return (
    <div className="basket">
      <HeaderBasket />
      <main className="basket__main">
        <BasketContent />
      </main>
      <Footer />
    </div>
  );
}
