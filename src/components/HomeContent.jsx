import Hero from "./Home";
import About from "./About";
import Courses from "./Courses";
import Instructors from "./Instructors";
import Portfolio from "./Portfolio";
import Gallery from "./Gallery";
import Testimonials from "./Testimonials";
import Contact from "./Contact";

export default function HomeContent() {
  return (
    <div className="space-y-16 md:space-y-20 pb-16 md:pb-24">
      <Hero />
      <Courses />
      <Instructors />
      <About />
      <Portfolio />
      <Gallery />
      <Testimonials />
      <Contact />
    </div>
  );
}
