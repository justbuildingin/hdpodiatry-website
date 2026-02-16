(() => {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  if (!form || !statusEl) return;

  const setError = (name, msg) => {
    const el = form.querySelector(`.error[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const clearErrors = () => {
    form.querySelectorAll(".error").forEach(e => (e.textContent = ""));
  };

  const normalizePhone = (s) => (s || "").replace(/[^\d]/g, "");
  const isLikelyUSPhone = (digits) => digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    statusEl.textContent = "";

    const data = new FormData(form);
    const hp = (data.get("website") || "").toString().trim();
    if (hp) {
      statusEl.textContent = "Thanks!";
      form.reset();
      return;
    }

    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const consent = data.get("consent");

    let ok = true;

    if (name.length < 2) { setError("name", "Please enter your full name."); ok = false; }

    const phoneDigits = normalizePhone(phone);
    if (!phoneDigits || !isLikelyUSPhone(phoneDigits)) {
      setError("phone", "Please enter a valid phone number.");
      ok = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      ok = false;
    }

    if (message.length < 10) { setError("message", "Please add a bit more detail."); ok = false; }
    if (!consent) { setError("consent", "Please check the consent box to continue."); ok = false; }

    if (!ok) {
      statusEl.textContent = "Please fix the highlighted fields.";
      return;
    }

    // Submit as JSON (works with Express API below). For Formspree, see notes below.
    const payload = Object.fromEntries([...data.entries()]
      .filter(([k]) => k !== "website"));

    try {
      statusEl.textContent = "Sending…";

      const res = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { "Accept": "application/json" }
});


      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Request failed");
      }

      statusEl.textContent = "Message sent! We’ll contact you soon.";
      form.reset();
    } catch (err) {
      console.error(err);
      statusEl.textContent =
        "Sorry—something went wrong sending your message. Please call the office or try again.";
    }
  });
})();
