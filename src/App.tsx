import React, { useEffect, useRef, useState } from 'react';

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // --- Custom Cursor ---
    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${cursorX - 3}px`;
        cursorDotRef.current.style.top = `${cursorY - 3}px`;
      }
    };

    const animateCursor = () => {
      outlineX += (cursorX - outlineX) * 0.15;
      outlineY += (cursorY - outlineY) * 0.15;
      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.left = `${outlineX - 10}px`;
        cursorOutlineRef.current.style.top = `${outlineY - 10}px`;
      }
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const animationFrame = requestAnimationFrame(animateCursor);

    // --- Hero Canvas ---
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        let particles: any[] = [];
        let mouse = { x: 0, y: 0, radius: 150 };

        const handleCanvasMouseMove = (e: MouseEvent) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        };

        const initCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          particles = [];
          for (let i = 0; i < 80; i++) {
            particles.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              size: Math.random() * 2 + 1,
              vx: Math.random() * 2 - 1,
              vy: Math.random() * 2 - 1,
              update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x > canvas.width || this.x < 0) this.vx *= -1;
                if (this.y > canvas.height || this.y < 0) this.vy *= -1;
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                  if (mouse.x < this.x && this.x < canvas.width - 10) this.x += 3;
                  if (mouse.x > this.x && this.x > 10) this.x -= 3;
                  if (mouse.y < this.y && this.y < canvas.height - 10) this.y += 3;
                  if (mouse.y > this.y && this.y > 10) this.y -= 3;
                }
              },
              draw() {
                ctx.fillStyle = 'rgba(0, 164, 239, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
              }
            });
          }
        };

        const animateParticles = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particles.forEach((p, i) => {
            p.update(); p.draw();
            for (let j = i; j < particles.length; j++) {
              let dx = particles[i].x - particles[j].x;
              let dy = particles[i].y - particles[j].y;
              let dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120) {
                ctx.strokeStyle = `rgba(0, 164, 239, ${1 - dist / 120})`;
                ctx.lineWidth = 0.5; ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
              }
            }
          });
          requestAnimationFrame(animateParticles);
        };

        initCanvas();
        animateParticles();
        window.addEventListener('resize', initCanvas);
        window.addEventListener('mousemove', handleCanvasMouseMove);
      }
    }

    // --- Typewriter ---
    const texts = ["Microsoft D365 F&O/SCM Developer", "Technical Consultant", "X++ Specialist", "ERP Solutions Engineer"];
    let count = 0;
    let index = 0;
    let isDeleting = false;
    
    const type = () => {
      const currentText = texts[count % texts.length];
      if (isDeleting) {
        index--;
      } else {
        index++;
      }

      if (typewriterRef.current) {
        typewriterRef.current.textContent = currentText.substring(0, index);
      }

      let typeSpeed = 100;
      if (isDeleting) typeSpeed /= 2;

      if (!isDeleting && index === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && index === 0) {
        isDeleting = false;
        count++;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };
    type();

    // --- Reveal Observer ---
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          if (entry.target.classList.contains('stats-grid')) {
             const stats = entry.target.querySelectorAll('.stat-number');
             stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target') || '0');
                let curr = 0;
                const timer = setInterval(() => {
                    curr += target / 50;
                    if (curr >= target) {
                        stat.textContent = target + '+';
                        clearInterval(timer);
                    } else {
                        stat.textContent = Math.floor(curr) + '+';
                    }
                }, 40);
             });
          }

        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    document.querySelectorAll('.stats-grid').forEach(el => observer.observe(el));


    // Sticky Nav
    const handleScroll = () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 50) nav.classList.add('sticky');
            else nav.classList.remove('sticky');
        }
        const btt = document.querySelector('#backToTop');
        if (btt) {
            if (window.scrollY > 500) btt.classList.add('show');
            else btt.classList.remove('show');
        }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDownloadCV = () => {
    const resumeHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Yash Nemkul - Resume</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { margin-bottom: 5px; color: #00a4ef; }
          h2 { border-bottom: 2px solid #00a4ef; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; font-size: 1.1rem; }
          .header-info { margin-bottom: 20px; }
          .exp-item { margin-bottom: 20px; }
          .exp-header { display: flex; justify-content: space-between; font-weight: bold; }
          .skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          ul { padding-left: 20px; }
          @media print { body { margin: 0; padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Yash Nemkul</h1>
        <div className="header-info">
          Microsoft D365 F&O/SCM Developer / Technical Consultant<br>
          Kathmandu, Nepal | +977 9818012644 | yashnem@gmail.com
        </div>
        
        <h2>Overview</h2>
        <p>Passionate Microsoft Dynamics 365 Finance & Operations Developer/Technical Consultant with strong technical and functional knowledge. Experienced in designing and implementing D365 F&O and Supply Chain solutions to improve operations and user experience. Skilled in X++, Microsoft SQL Server, and Azure DevOps.</p>

        <h2>Areas of Expertise</h2>
        <ul>
          <li><strong>Tools & Platforms:</strong> D365 F&O/SCM, SSIS, Power BI, Power Automate, RSAT, JMeter</li>
          <li><strong>Programming:</strong> X++, C#, SQL</li>
          <li><strong>Data/Testing:</strong> ETL, DDL/DML, Data Validation, Automated Testing</li>
          <li><strong>Web:</strong> HTML, CSS, Bootstrap, Wordpress</li>
          <li><strong>Other:</strong> Azure DevOps, Agile, GitHub, Linux</li>
        </ul>

        <h2>Professional Experience</h2>
        <div className="exp-item">
          <div className="exp-header"><span>KonstantSolutions LLC</span> <span>2023 - Present</span></div>
          <em>Microsoft Dynamics F&O/SCM Technical Consultant</em>
          <ul>
            <li>Developed and customized tables, forms, reports and data entities in D365 F&O.</li>
            <li>Managed data migration and data management tasks utilizing DMF and SSIS.</li>
            <li>Designed and implemented OData integration APIs.</li>
            <li>Handled modules including AP, AR, HR, Sales, Purchase and Production orders.</li>
            <li>Optimized license costs through security role and privilege management.</li>
          </ul>
        </div>

        <div className="exp-item">
          <div className="exp-header"><span>LIS Nepal</span> <span>Nov 2022 - May 2023</span></div>
          <em>Software Engineering Intern</em>
          <ul>
            <li>Assisted in ETL development and data validation processes.</li>
            <li>Contributed to historical data migration and testing for system upgrades.</li>
            <li>Mapped data using Snowflake and MicroStrategy.</li>
          </ul>
        </div>

        <h2>Relevant Projects</h2>
        <ul>
          <li><strong>Security Role & Licensing Optimization:</strong> Reduced Microsoft licensing costs through role analysis.</li>
          <li><strong>Business Process Automation (RSAT):</strong> Automated end-to-end scenarios for Procurement, Production, and Sales.</li>
          <li><strong>Legacy Data Migration (SSIS):</strong> Migrated transactional data from legacy systems to D365.</li>
        </ul>

        <h2>Education</h2>
        <p><strong>BSc (Hons) Computer System Engineering | 2018 - 2022</strong><br>
        International School of Management and Technology (ISMT), Affiliated with University of Sunderland</p>

        <h2>Certification</h2>
        <p>Microsoft Certified: Dynamics 365: Finance and Operations Apps Developer Associate (MB-500)</p>
      </body>
      </html>
    `;
    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Yash_Nemkul_CV.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Convert FormData to JSON for AJAX support
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/yashnem@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        setFormSubmitted(true);
      } else {
        console.error("Form submission failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div id="cursor-outline" ref={cursorOutlineRef} style={{position: 'fixed', pointerEvents: 'none', zIndex: 10000, width: '20px', height: '20px', border: '1.5px solid var(--accent-blue)', borderRadius: '50%', transition: 'transform 0.1s ease-out'}}></div>
      <div id="cursor-dot" ref={cursorDotRef} style={{position: 'fixed', pointerEvents: 'none', zIndex: 10000, width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%'}}></div>

      <nav id="navbar" className="fixed top-0 w-full z-1000 py-5 transition-all duration-400">
        <div className="container mx-auto px-5 flex justify-between items-center">
            <a href="#hero" className="logo font-bold text-2xl flex items-center gap-2"><i className="fa-solid fa-code text-accent-blue"></i> D365 Consultant</a>
            <ul className={`nav-links flex gap-8 items-center ${isMenuOpen ? 'active fixed top-0 right-0 w-full h-screen bg-bg-deep flex-col justify-center' : 'max-md:hidden'}`}>
                <li><a href="#hero" className="nav-link text-text-dim hover:text-white transition-all">Home</a></li>
                <li><a href="#about" className="nav-link text-text-dim hover:text-white transition-all">About</a></li>
                <li><a href="#skills" className="nav-link text-text-dim hover:text-white transition-all">Skills</a></li>
                <li><a href="#experience" className="nav-link text-text-dim hover:text-white transition-all">Experience</a></li>
                <li><a href="#projects" className="nav-link text-text-dim hover:text-white transition-all">Projects</a></li>
                <li><a href="#services" className="nav-link text-text-dim hover:text-white transition-all">Services</a></li>
                <li><a href="#contact" className="nav-link text-text-dim hover:text-white transition-all">Contact</a></li>
                <li><a href="#contact" className="hire-btn bg-accent-blue text-white px-6 py-2.5 rounded-full font-semibold hover:-translate-y-1 hover:shadow-lg transition-all">Hire Me</a></li>
            </ul>
            <div className="menu-toggle md:hidden text-2xl cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </div>
        </div>
      </nav>

      <section id="hero" className="h-screen flex items-center relative overflow-hidden">
        <canvas id="hero-canvas" ref={canvasRef} className="absolute top-0 left-0 w-full h-full z--1"></canvas>
        <div className="container mx-auto px-5">
            <div className="hero-content reveal max-w-3xl">
                <h1 className="text-6xl max-md:text-4xl leading-tight mb-5">I am a <span className="typewriter text-accent-blue border-r-3 border-accent-blue animate-caret" ref={typewriterRef}></span></h1>
                <p className="text-xl text-text-dim mb-10">Transforming complex business processes into elegant ERP solutions with 3+ years of hands-on Dynamics 365 expertise.</p>
                <div className="hero-btns flex gap-5">
                    <button className="btn btn-primary bg-accent-blue text-white px-8 py-4 rounded-lg font-bold hover:-translate-y-1 hover:shadow-xl transition-all" onClick={() => window.location.href='#projects'}>View My Work</button>
                    <button className="btn btn-outline border-2 border-accent-blue text-white px-8 py-4 rounded-lg font-bold hover:-translate-y-1 hover:shadow-xl transition-all" onClick={handleDownloadCV}>Download CV</button>
                </div>
                <div className="floating-badges mt-12 flex flex-wrap gap-4">
                    {["D365 F&O", "X++", "Azure DevOps", "Power Platform", "SQL", "Testing", "SSIS", "RSAT"].map((b, i) => (
                        <span key={i} className="badge bg-white/5 border border-white/10 px-5 py-2 rounded-full text-sm animate-float" style={{animationDelay: `${i * 0.5}s`}}>{b}</span>
                    ))}
                </div>
            </div>
            <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <i className="fa-solid fa-chevron-down"></i>
            </div>
        </div>
      </section>

      <section id="about" className="py-24">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">About Me</h2>
            <div className="about-content max-w-4xl mx-auto">
                <div className="about-text reveal text-center">
                    <p className="text-lg mb-8">I specialize in end-to-end Microsoft Dynamics 365 Finance & Operations and Supply Chain Management implementations. I bring deep technical expertise in X++ development, data migrations using DMF/SSIS, OData integrations, and performance optimization using trace parser and JMeter.</p>
                    <div className="stats-grid grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
                        {[
                            { label: "Years Experience", target: 3 },
                            { label: "Projects Delivered", target: 12 },
                            { label: "Industries Served", target: 6 }
                        ].map((s, i) => (
                            <div key={i} className="stat-card glass p-8 text-center">
                                <span className="stat-number text-4xl font-bold text-accent-gold block" data-target={s.target}>0</span>
                                <span className="stat-label text-sm text-text-dim">{s.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="cert-badge inline-flex items-center gap-3 bg-accent-blue/10 px-5 py-3 rounded-lg mt-8 text-accent-blue font-bold">
                        <i className="fa-solid fa-certificate"></i> MB-500 Certified Developer
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section id="skills" className="py-24 bg-white/1">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">Technical Arsenal</h2>
            <div className="skills-grid grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Core Platform", icon: "fa-layer-group", skills: ["D365 F&O", "D365 SCM", "AX 2012", "X++", "AOT", "DMF", "SSIS"] },
                    { title: "Development", icon: "fa-code", skills: ["Visual Studio", "LCS", "C#", "SQL", "Azure DevOps", "SSRS", "Power Automate", "RSAT"] },
                    { title: "Integration", icon: "fa-circle-nodes", skills: ["REST/SOAP", "OData", "Logic Apps", "Service Bus", "ER", "Dual-write", "Postman"] }
                ].map((c, i) => (
                    <div key={i} className="skill-card glass p-8 hover:border-accent-blue hover:shadow-[0_10px_40px_rgba(0,164,239,0.1)] hover:-translate-y-1 transition-all reveal">
                        <div className="skill-header flex items-center gap-4 mb-6">
                            <i className={`fa-solid ${c.icon} text-2xl text-accent-blue`}></i>
                            <h3 className="text-xl font-bold">{c.title}</h3>
                        </div>
                        <div className="skill-list flex flex-wrap gap-2">
                            {c.skills.map(s => <span key={s} className="skill-tag bg-white/5 border border-white/10 px-3 py-1 rounded text-xs">{s}</span>)}
                        </div>
                    </div>
                ))}
            </div>


        </div>
      </section>

      <section id="experience" className="py-24">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">Career Journey</h2>
            <div className="timeline relative max-w-4xl mx-auto after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-0 after:bottom-0 after:w-0.5 after:bg-white/10 max-md:after:left-5">
                {[
                    { date: "2023 – Present", company: "KonstantSolutions LLC", role: "D365 F&O Technical Consultant", desc: "Developing customized tables, forms, and reports in D365 F&O. Leading OData integration API development and managing large-scale data migrations utilizing DMF and SSIS." },
                    { date: "Nov 2022 – May 2023", company: "LIS Nepal", role: "Software Engineering Intern", desc: "Assisted in ETL development and data validation processes. Contributed to historical data migration and testing for system upgrades using Snowflake and MicroStrategy." }
                ].map((ex, i) => (
                    <div key={i} className={`timeline-item flex mb-16 relative ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} max-md:flex-row`}>
                        <div className="timeline-dot absolute left-1/2 -translate-x-1/2 top-5 w-5 h-5 bg-accent-blue rounded-full shadow-[0_0_15px_var(--accent-blue)] z-10 after:content-[''] after:absolute after:inset-0 after:bg-inherit after:rounded-full after:animate-pulse-slow max-md:left-5"></div>
                        <div className={`timeline-content w-[45%] p-8 glass reveal ${i % 2 === 0 ? 'text-right' : 'text-left'} max-md:w-full max-md:ml-12 max-md:text-left`}>
                            <span className="timeline-date text-accent-gold font-bold text-sm mb-2 block">{ex.date}</span>
                            <h3 className="text-xl font-bold mb-1">{ex.company}</h3>
                            <h4 className="text-accent-blue text-sm mb-4">{ex.role}</h4>
                            <p className="text-sm text-text-dim">{ex.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="projects" className="py-24">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">Featured Projects</h2>
            <div className="projects-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { tag: "Security & Optimization", title: "Security Role & Licensing Optimization", desc: "Reduced licensing costs by analyzing and optimizing security roles and user assignments.", tech: ["Security", "X++", "Compliance"] },
                    { tag: "Testing Automation", title: "Business Process Automation using RSAT", desc: "Automated end-to-end scenarios for Procurement, Production and Sales using RSAT.", tech: ["RSAT", "Task Recorder", "Automation"] },
                    { tag: "Integration", title: "Integration with OData & Custom Services", desc: "Designed integrations for employee and sales data ensuring seamless system exchange.", tech: ["OData", "REST", "Custom Services"] },
                    { tag: "Migration", title: "Legacy Data Migration to D365", desc: "Migrated master and transactional data from legacy systems using SSIS and DMF.", tech: ["DMF", "SSIS", "SQL"] },
                    { tag: "Compliance", title: "Data Privacy & Compliance Support", desc: "Implemented Data Erasure, Data Do Not Sell, and GDPR-compliant features.", tech: ["Privacy", "Security", "D365"] },
                    { tag: "Protection", title: "Data Protection & Encryption Support", desc: "Supported security initiatives by assisting in data masking and encryption controls.", tech: ["Encryption", "Masking", "Security"] }
                ].map((p, i) => (
                    <div key={i} className="project-card glass p-8 flex flex-col hover:-translate-y-2 hover:scale-[1.02] hover:border-accent-blue transition-all reveal">
                        <span className="project-tag text-accent-blue text-xs font-bold mb-2 uppercase">{p.tag}</span>
                        <h3 className="text-xl font-bold mb-4">{p.title}</h3>
                        <p className="text-sm text-text-dim mb-6 flex-grow">{p.desc}</p>
                        <div className="project-tech flex flex-wrap gap-2 mb-6">
                            {p.tech.map(t => <span key={t} className="skill-tag bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px]">{t}</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-white/1">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">What I Offer</h2>
            <div className="services-grid grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                    { icon: "fa-screwdriver-wrench", title: "Technical Development", desc: "X++ customizations, extensions, forms, reports, data entities, and T-SQL optimization." },
                    { icon: "fa-link", title: "System Integration", desc: "Building bridges via API, Logic Apps, Service Bus, OData, and Custom Services." },
                    { icon: "fa-chart-line", title: "Reporting & Analytics", desc: "Insights via SSRS, embedded Power BI, and Electronic Reporting (ER)." }
                ].map((s, i) => (
                    <div key={i} className="service-card glass p-10 text-center reveal">
                        <i className={`fa-solid ${s.icon} text-5xl text-accent-blue mb-6`}></i>
                        <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                        <p className="text-sm text-text-dim">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="container mx-auto px-5">
            <h2 className="section-title text-center text-4xl mb-16 relative after:content-[''] after:absolute after:bottom--4 after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-1 after:bg-accent-blue">Get In Touch</h2>
            <div className="contact-content max-w-5xl mx-auto">
                <div className="contact-info-grid grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                    {[
                        { icon: "fa-envelope", label: "Email Me", val: "yashnem@gmail.com" },
                        { icon: "fa-phone", label: "Phone", val: "+977 9818012644" },
                        { icon: "fa-location-dot", label: "Location", val: "Kathmandu, Nepal (Open to remote work)" }
                    ].map((inf, i) => (
                        <div key={i} className="info-item flex flex-col items-center text-center gap-4 reveal">
                            <div className="w-16 h-16 bg-accent-blue/10 rounded-full flex items-center justify-center mb-2">
                                <i className={`fa-solid ${inf.icon} text-2xl text-accent-blue`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-1">{inf.label}</h4>
                                <p className="text-text-dim text-sm">{inf.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-12">
                    <div className="availability inline-flex items-center gap-3 bg-green-500/10 text-green-400 px-6 py-3 rounded-full font-bold reveal">
                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]"></div> 
                        Available for projects/contract work fulltime/parttime
                    </div>

                    <form className="contact-form glass p-10 w-full max-w-2xl flex flex-col gap-5 reveal" onSubmit={handleSubmit}>
                    {!formSubmitted ? (
                        <>
                            <div className="form-group flex flex-col gap-2">
                                <label className="text-sm font-semibold">Full Name</label>
                                <input type="text" name="name" required placeholder="John Doe" className="bg-white/5 border border-white/10 p-3 rounded-lg focus:outline-accent-blue" />
                            </div>
                            <div className="form-group flex flex-col gap-2">
                                <label className="text-sm font-semibold">Email</label>
                                <input type="email" name="email" required placeholder="john@example.com" className="bg-white/5 border border-white/10 p-3 rounded-lg focus:outline-accent-blue" />
                            </div>
                            <div className="form-group flex flex-col gap-2">
                                <label className="text-sm font-semibold">Subject</label>
                                <select name="subject" className="bg-white/5 border border-white/10 p-3 rounded-lg focus:outline-accent-blue">
                                    <option>Implementation</option>
                                    <option>Development</option>
                                    <option>Consulting</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-2">
                                <label className="text-sm font-semibold">Message</label>
                                <textarea name="message" rows={4} required placeholder="Your message here..." className="bg-white/5 border border-white/10 p-3 rounded-lg focus:outline-accent-blue" />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`submit-btn bg-accent-blue text-white py-4 rounded-lg font-bold flex items-center justify-center gap-3 hover:brightness-110 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>Processing... <i className="fa-solid fa-spinner fa-spin"></i></>
                                ) : (
                                    <>Send Message <i className="fa-solid fa-paper-plane"></i></>
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="success-msg text-center py-10 animate-fade-in">
                            <i className="fa-solid fa-circle-check text-6xl text-green-400 mb-5"></i>
                            <h3 className="text-2xl font-bold">Message Sent!</h3>
                            <p className="text-text-dim">Thank you for reaching out. I'll get back to you shortly.</p>
                            <button onClick={() => setFormSubmitted(false)} className="mt-8 text-accent-blue font-semibold underline">Send another message</button>
                        </div>
                    )}
                </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#050713] pt-20 pb-8 border-t border-white/10">
        <div className="container mx-auto px-5">
            <div className="footer-content flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><i className="fa-solid fa-code text-accent-blue"></i> D365 Consultant</h2>
                    <p className="text-text-dim text-sm leading-relaxed">Expert Microsoft Dynamics 365 F&O/SCM Technical Developer specializing in high-scale ERP solutions and complex integrations.</p>
                </div>
                <div className="md:text-right">
                    <h4 className="font-bold mb-6">Follow Me</h4>
                    <div className="flex md:justify-end gap-5 text-2xl">
                        <a href="https://www.linkedin.com/in/yash-nemkul-889488185/" target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-all"><i className="fa-brands fa-linkedin"></i></a>
                        <a href="https://github.com/Yash1234554321" target="_blank" rel="noopener noreferrer" className="hover:text-accent-blue transition-all"><i className="fa-brands fa-github"></i></a>
                    </div>
                </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex justify-center items-center text-xs text-text-dim">
                <p className="text-center">Yash Nemkul © 2026 D365 Consultant. Built with expertise in ERP.</p>
            </div>
        </div>
      </footer>

      <a href="#hero" id="backToTop" className="fixed bottom-8 right-8 w-12 h-12 bg-accent-blue rounded-full hidden items-center justify-center text-xl z-50 shadow-lg hover:-translate-y-1 transition-all">
        <i className="fa-solid fa-arrow-up"></i>
      </a>

      <style>{`
        @keyframes caret { from { border-color: transparent } to { border-color: var(--accent-blue) } }
        .animate-caret { animation: caret 1s infinite alternate; }
        
        @keyframes float { from { transform: translateY(0) } to { transform: translateY(-10px) } }
        .animate-float { animation: float 4s ease-in-out infinite alternate; }
        
        @keyframes pulse-slow { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
        .animate-pulse-slow { animation: pulse-slow 2s infinite; }

        .sticky {
            background: rgba(10, 14, 39, 0.9) !important;
            backdrop-filter: blur(10px);
            padding: 12px 0 !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        
        .show { display: flex !important; }
      `}</style>
    </>
  );
}
