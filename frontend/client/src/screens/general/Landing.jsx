import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

// Import assets
import heroImage from "../../assets/model photos/landing/landing-sec1.png";
import sec2Left from "../../assets/model photos/landing/sec2-left.png";
import sec2Middle from "../../assets/model photos/landing/sec2-middle.png";
import sec2Right from "../../assets/model photos/landing/sec2-right.png";
import sec2BG from "../../assets/backgrounds/landing/sec2-BG.png";
import sec3BG from "../../assets/backgrounds/landing/sec3-BG.png";
import sec4BG from "../../assets/backgrounds/landing/sec4-BG.png";
import fbIcon from "../../assets/icons/fb.png";
import igIcon from "../../assets/icons/ig.png";
import pinterestIcon from "../../assets/icons/pinterest.png";
import vivideLogo from "../../assets/icons/vivide logo footer.png";
import vivideLogoB from "../../assets/icons/vivide logo black.png";
import arrowUp from "../../assets/icons/arrow-up.png";
import AnimatedContent from "../../component/AnimatedContent";
import TiltedCard from "../../component/TiltedCard";

export default function Landing() {
  const containerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <a href="#top" className="brand">
          <img src={vivideLogoB} alt="Vivide" className="header-logo" />
        </a>
        <nav className="landing-nav">
          <a href="#community">The Community</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact Us</a>
        </nav>
          <Link to="/login" className="login-pill">
            LOGIN
          </Link>
      </header>

      <section className="landing-hero" id="top">
        <p className="hero-tagline">
          WHERE IDENTITIES EVOLVE
          <br />
          AND STYLE IS ENDLESS.
          <br />
          VIVIDE CELEBRATES
          <br />
          THE ART OF BECOMING.
        </p>
        <div className="hero-cta">
          <div className="hero-cta-title">JOIN US</div>
          <div className="hero-cta-subtitle">Express freely</div>
          <div className="hero-cta-author">By Vincent Garcia</div>
        </div>
      </section>

      <AnimatedContent
        distance={100}
        direction="vertical"
        reverse
        duration={0.8}
        ease="power3.out"
        initialOpacity={0}
        animateOpacity
        scale={1}
        threshold={0.1}
        delay={0}
        className="hero-transition-image"
      >
        <img src={heroImage} alt="Model" className="hero-image" />
      </AnimatedContent>

      <section className="landing-community" id="community">
        <h2>Our Community</h2>
        <div className="community-cards">
          <article>
            <h3 className="community-card-title">Share Looks</h3>
            <div className="community-card-image">
              <TiltedCard imageSrc={sec2Left} alt="Share Looks" />
            </div>
            <p className="community-card-description">
              Post makeup looks, fashion fits, and cosplay ideas. From everyday
              vibes to full transformations.
            </p>
          </article>
          <article>
            <h3 className="community-card-title">Learn &amp; Discover</h3>
            <div className="community-card-image">
              <TiltedCard imageSrc={sec2Middle} alt="Learn & Discover" />
            </div>
            <p className="community-card-description">
              Explore tutorials, step-by-step guides, and creative techniques
              shared by the community.
            </p>
          </article>
          <article>
            <h3 className="community-card-title">Style Sustainably</h3>
            <div className="community-card-image">
              <TiltedCard imageSrc={sec2Right} alt="Style Sustainably" />
            </div>
            <p className="community-card-description">
              Promote upcycling, thrifted outfits, and conscious fashion choices
              that look good and do good.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-about" id="about">
        <div className="about-card">
          <h2>About Us</h2>
          <p>
            Vivide is a community-driven platform where creativity thrives. We
            bring together makeup lovers, fashion explorers, and cosplay
            creators in a positive and inclusive space. Here, self-expression is
            celebrated in all its forms: bold, soft, experimental, or
            unexpected.
          </p>
          <p>
            Whether you're just starting out or already creating your own style,
            Vivide is a place to be seen, supported, and inspired.
          </p>
        </div>
      </section>

      <section className="landing-contact" id="contact">
        <h2>Contact Us</h2>
        <p>Have questions, ideas, or feedback? We'd love to hear from you.</p>
        <div className="contact-links">
          <a href="#">FAQ</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Email</a>
          <a href="#">Community</a>
          <a href="#">About Us</a>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            <img src={fbIcon} alt="Facebook" />
          </a>
          <a href="#" aria-label="Pinterest">
            <img src={pinterestIcon} alt="Pinterest" />
          </a>
          <a href="#" aria-label="Instagram">
            <img src={igIcon} alt="Instagram" />
          </a>
        </div>
        <img src={vivideLogo} alt="Vivide" className="footer-logo" />
      </section>

      <button
        type="button"
        className={`scroll-top ${showScrollTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <img src={arrowUp} alt="Scroll to top" />
      </button>
    </div>
  );
}
