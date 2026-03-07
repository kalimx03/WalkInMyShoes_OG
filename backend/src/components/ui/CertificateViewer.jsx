import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../../store/appStore'

export default function CertificateViewer() {
  const { setCurrentScene, certificates, user } = useAppStore()
  const [selectedCertificate, setSelectedCertificate] = useState(null)

  if (certificates.length === 0) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism p-8 max-w-md mx-auto text-center"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold gradient-text mb-4">No Certificates Yet</h2>
          <p className="text-gray-300 mb-6">
            Complete scenarios to earn your empathy training certificates
          </p>
          <button
            onClick={() => setCurrentScene('menu')}
            className="button-primary"
          >
            Start Training
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-navy p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Your Certificates
          </h1>
          <p className="text-xl text-gray-300">
            View and download your achievement certificates
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism p-6"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold mb-2">Empathy Training</h3>
                <div className="text-lg text-purple-accent mb-2">{certificate.badge}</div>
                <div className="text-gray-300 mb-4">
                  Score: {certificate.score}/100
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {certificate.date}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  ID: {certificate.id}
                </div>
                <button
                  onClick={() => setSelectedCertificate(certificate)}
                  className="button-primary text-sm w-full"
                >
                  View Certificate
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setCurrentScene('dashboard')}
            className="button-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Certificate of Empathy Training
              </h1>
              <div className="text-xl text-gray-600 mb-6">
                WalkInMyShoes - Immersive Disability Empathy Platform
              </div>
              
              <div className="border-4 border-double border-purple-accent p-8 mb-6">
                <div className="text-lg text-gray-700 mb-4">
                  This certifies that
                </div>
                <div className="text-2xl font-bold text-purple-accent mb-4">
                  {selectedCertificate.userName}
                </div>
                <div className="text-lg text-gray-700 mb-4">
                  has successfully completed the disability empathy training
                </div>
                <div className="text-xl font-semibold text-gray-800 mb-2">
                  Empathy Score: {selectedCertificate.score}/100
                </div>
                <div className="text-lg text-gray-600 mb-4">
                  {selectedCertificate.badge}
                </div>
                <div className="text-gray-600">
                  Completed on {selectedCertificate.date}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Certificate ID: {selectedCertificate.id}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-purple-accent text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
