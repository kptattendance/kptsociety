import AboutUs from "../components/HomePageComponents/AboutUs";
import ContactUs from "../components/HomePageComponents/ContactUs";
import Membership from "../components/HomePageComponents/Membership";
import Gallery from "../components/HomePageComponents/Gallery";
import Footer from "../components/Footer";
import OurTeam from "../components/HomePageComponents/OurTeam";

export default function Home() {
  return (
    <>
      <AboutUs />
      <Membership />
      <OurTeam />
      <Gallery />
      <ContactUs />
      <Footer />
    </>
  );
}
