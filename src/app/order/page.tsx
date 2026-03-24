import HeaderOrder from "../components/HeaderOrder/HeaderOrder";
import DescriptionOrder from "../components/DescriptionOrder/DescriptionOrder";
import Footer from "../components/Footer/Footer";

export default function Order() {
  return (
    <div className="order flex min-h-full flex-col">
      <HeaderOrder />
      <DescriptionOrder/>
      <Footer/>
    </div>
  );
}