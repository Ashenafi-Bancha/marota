// src/components/Contact.jsx
import { useState } from "react";
import Map from "../components/Map";
import BuildingSlideshow from "../components/BuildingSlideshow";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import MarotaBuilding1 from "../../../assets/marota-location.jpg";
import MarotaBuilding2 from "../../../assets/marota-building3.jpg";

const images = [MarotaBuilding1, MarotaBuilding2];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatusMessage({
        type: "error",
        text: "Please upload a valid image file.",
      });
      event.target.value = "";
      setImageFile(null);
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setStatusMessage({
        type: "error",
        text: "Image size should be 5MB or less.",
      });
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setStatusMessage(null);
    setImageFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setStatusMessage({
        type: "error",
        text: "Please fill in your name, email, and message.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("email", email);
      payload.append("message", message);
      payload.append("_subject", "New Contact Message - Marota Website");
      payload.append("_captcha", "false");
      payload.append("_template", "table");

      if (imageFile) {
        payload.append("attachment", imageFile);
      }

      const response = await fetch("https://formsubmit.co/ajax/mathsermi50@gmail.com", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || result.success !== "true") {
        throw new Error(result.message || "Unable to send message right now.");
      }

      setStatusMessage({
        type: "success",
        text: "Your message was sent successfully.",
      });
      setFormData({ name: "", email: "", message: "" });
      setImageFile(null);
    } catch (error) {
      setStatusMessage({
        type: "error",
        text: error.message || "Unable to send message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-[#0a192f] text-white">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12">

        {/* Contact Info */}
        <div className="space-y-4 md:space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h3>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <FaPhone className="text-blue-400 text-2xl" />
              <span className="text-lg">+251 9 28 97 63 93</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-blue-400 text-2xl" />
              <span className="text-lg">mathsermi50@gmail.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaMapMarkerAlt className="text-blue-400 text-2xl" />
              <span className="text-lg">Wolaita Sodo, Ethiopia</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaBuilding className="text-blue-400 text-2xl" />
              <span className="text-lg">Tona Complex, 2nd floor</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="flex flex-col space-y-4">
          <h4 className="text-2xl font-semibold text-white">Send Us a Message</h4>
          <form className="flex flex-col space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
              className="p-3 rounded-md bg-[#112240] border border-gray-700 text-white focus:outline-none focus:border-cyan-400"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="p-3 rounded-md bg-[#112240] border border-gray-700 text-white focus:outline-none focus:border-cyan-400"
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Message"
              rows="2"
              required
              className="p-3 rounded-md bg-[#112240] border border-gray-700 text-white focus:outline-none focus:border-cyan-400"
            ></textarea>

            <div className="flex flex-col gap-2">
              <label htmlFor="contact-image" className="text-sm text-gray-300">
                Upload Image (optional)
              </label>
              <input
                id="contact-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="p-2 rounded-md bg-[#112240] border border-gray-700 text-sm text-gray-200"
              />
              {imageFile && (
                <p className="text-xs text-cyan-300">Attached: {imageFile.name}</p>
              )}
            </div>

            {statusMessage && (
              <p
                className={`text-sm ${
                  statusMessage.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {statusMessage.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--accent-blue)] text-black px-6 py-3 rounded-md font-semibold hover:bg-teal-300 hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Marota Building Slideshow */}
        <div className="md:col-span-2 mt-8 relative">
          <BuildingSlideshow images={images} interval={3000} />
          {/* Overlay Text */}
          <div className="absolute top-4 left-4 bg-black/50 px-4 py-2 rounded text-yellow-300 text-lg font-bold">
            Visit Our Office
          </div>
        </div>

        {/* Map Section */}
        <div className="md:col-span-2 mt-8 flex flex-col space-y-2">
          <p className="text-center text-yellow-300 font-bold text-lg">
            Use Google Maps to reach our office 
          </p>
          <Map />
        </div>
      </div>
    </section>
  );
};

export default Contact;
