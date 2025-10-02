import AboutUs from "../components/HomePageComponents/AboutUs";
import ContactUs from "../components/HomePageComponents/ContactUs";
import LoanCalculatorPage from "../components/HomePageComponents/LoanCalculatorPage";
import NewsAndAnnouncements from "../components/HomePageComponents/NewsAndAnnouncements";
import Membership from "../components/HomePageComponents/Membership";
import Services from "../components/HomePageComponents/Services";
import Downloads from "../components/HomePageComponents/Downloads";
import Gallery from "../components/HomePageComponents/Gallery";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <AboutUs />
      <Membership />
      <Services />
      <LoanCalculatorPage />
      <Downloads />
      <NewsAndAnnouncements />
      <Gallery />
      <ContactUs />
      <Footer />
    </>
  );
}
