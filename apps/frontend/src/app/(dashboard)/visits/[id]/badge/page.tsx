
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { visitsApi } from '@/lib/api';
import { Visit } from '@/types';
import { AxiosError } from 'axios';

type BadgeData = {
  badgeNumber: string;
  qrCode: string;
  visitor: {
    name: string;
    company: string;
    photo?: string;
  };
  host: string;
  validUntil: string;
};

export default function BadgePage() {
  const params = useParams();
  const id = params.id as string;
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBadgeData = async () => {
        try {
          const response = await visitsApi.getBadge(id);
          setBadgeData(response.data);
        } catch (err) {
          const axiosError = err as AxiosError;
          if (axiosError.response?.status === 404) {
            setError('Badge non trovato per questa visita.');
          } else {
            setError('Errore nel caricamento del badge.');
          }
          console.error(err);
        }
      };
      fetchBadgeData();
    }
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!badgeData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Caricamento badge...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 border-4 border-blue-500">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">VISITOR</h1>
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 mb-4">
            {badgeData.visitor.photo ? (
              <img
                src={badgeData.visitor.photo}
                alt="Visitor"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Photo</span>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            {badgeData.visitor.name}
          </h2>
          <p className="text-gray-600">{badgeData.visitor.company}</p>
        </div>

        <div className="my-6 flex justify-center">
          <img src={badgeData.qrCode} alt="QR Code" className="w-48 h-48" />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Ospite: <span className="font-semibold">{badgeData.host}</span>
          </p>
          <p className="text-sm text-gray-500">
            Valido fino a:{' '}
            <span className="font-semibold">
              {new Date(badgeData.validUntil).toLocaleString()}
            </span>
          </p>
          <p className="mt-4 text-lg font-bold text-blue-600">
            {badgeData.badgeNumber}
          </p>
        </div>
      </div>
      <button
        onClick={() => window.open(`/api/visits/${id}/badge/pdf`, '_blank')}
        className="mt-6 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Scarica PDF
      </button>
    </div>
  );
}
