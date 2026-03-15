// src/components/Map.jsx
function Map() {
  return (
    <div className="w-full h-64 md:h-96 mt-6 rounded-xl overflow-hidden shadow-lg">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.2198053415345!2d37.75941632506457!3d6.864241697021886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17b1b1b35cb64c57%3A0x2b85cac60db3cfca!2sMarota%20Cinematography%20and%20Software%20Institute!5e0!3m2!1sen!2set!4v1757023402571!5m2!1sen!2set" // replace with Marota Studio's Google Maps embed URL
        width="100%"
        height="100%"
        className="border-0"
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  )
}

export default Map;
