import React, { useState } from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConsentFormProps {
  onConsent: (hasConsented: boolean) => void;
  isRequired?: boolean;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ onConsent, isRequired = true }) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRequired && !hasConsented) {
      return;
    }
    onConsent(hasConsented);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center mb-6">
          <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Privacy & Consent</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What We Do</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Analyze facial expressions from your selfies to estimate mood</li>
              <li>• Store only derived mood metrics (happiness, stress, valence, arousal)</li>
              <li>• Generate personalized mood trends and insights</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Privacy Protection</h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>No photos are stored</strong> - images are processed locally and discarded</li>
              <li>• Only numerical mood metrics are saved to our database</li>
              <li>• You can export or delete your data at any time</li>
              <li>• Your data is never shared with third parties</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Technical Details</h3>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• Facial analysis runs in your browser using face-api.js</li>
              <li>• Images never leave your device during processing</li>
              <li>• Only anonymized mood scores are transmitted to our servers</li>
              <li>• Data is encrypted in transit and at rest</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="readTerms"
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="readTerms" className="text-sm text-gray-700">
                I have read and understand how my data will be processed
              </label>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={!hasReadTerms}
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I consent to the processing of my facial expressions for mood analysis as described above
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isRequired && (!hasReadTerms || !hasConsented)}
                className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {hasConsented ? 'Accept & Continue' : 'Decline'}
              </button>
              
              {!isRequired && (
                <button
                  type="button"
                  onClick={() => onConsent(false)}
                  className="btn btn-secondary"
                >
                  Skip for now
                </button>
              )}
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            By using Moody, you agree to our processing of your mood data as described above. 
            You can withdraw consent and delete your data at any time from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentForm;