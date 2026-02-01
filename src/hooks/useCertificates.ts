import { useState, useEffect, useCallback, useMemo } from 'react';
import { Certificate, CertificateGroup } from '../types/certificate.types';

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockCertificates: Certificate[] = useMemo(() => [
    { 
      id: '1', 
      title: 'Manejo Seguro de Montacargas', 
      status: 'Vigente', 
      validUntil: new Date('2025-12-31'),
      obtained: new Date('2024-10-15'),
      folio: 'FOL-2024-5874-MGAS',
      category: 'Operación de Maquinaria',
      downloadUrl: '/certificates/1.pdf',
      instructor: 'Juan Pérez',
      duration: 40
    },
    { 
      id: '2', 
      title: 'Seguridad Industrial', 
      status: 'Vigente', 
      validUntil: new Date('2025-06-30'),
      obtained: new Date('2024-09-20'),
      folio: 'FOL-2024-4921-SIND',
      category: 'Seguridad',
      downloadUrl: '/certificates/2.pdf',
      instructor: 'María García',
      duration: 35
    },
    { 
      id: '3', 
      title: 'Trabajo en Alturas', 
      status: 'Vigente', 
      validUntil: new Date('2025-03-31'),
      obtained: new Date('2024-08-05'),
      folio: 'FOL-2024-3789-TALT',
      category: 'Seguridad',
      downloadUrl: '/certificates/3.pdf',
      instructor: 'Carlos López',
      duration: 25
    },
    { 
      id: '4', 
      title: 'Primeros Auxilios Avanzados', 
      status: 'En Progreso', 
      progress: 75,
      expires: new Date('2024-11-30'),
      category: 'Salud',
      instructor: 'Ana Martínez',
      duration: 30
    },
    { 
      id: '5', 
      title: 'Manejo de Sustancias Peligrosas', 
      status: 'En Progreso', 
      progress: 40,
      expires: new Date('2024-12-15'),
      category: 'Seguridad',
      instructor: 'Roberto Sánchez',
      duration: 20
    },
    { 
      id: '6', 
      title: 'Operación de Maquinaria Pesada', 
      status: 'Expirado', 
      validUntil: new Date('2024-03-31'),
      obtained: new Date('2023-03-15'),
      category: 'Operación',
      instructor: 'Pedro Rodríguez',
      duration: 50
    },
    { 
      id: '7', 
      title: 'Prevención de Incendios', 
      status: 'Expirado', 
      validUntil: new Date('2024-01-31'),
      obtained: new Date('2023-01-10'),
      category: 'Seguridad',
      instructor: 'Laura Fernández',
      duration: 15
    }
  ], []);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      
      
      
      
      
      setCertificates(mockCertificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
    } finally {
      setLoading(false);
    }
  }, [mockCertificates]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const groupedCertificates: CertificateGroup = useMemo(() => ({
    active: certificates.filter(cert => cert.status === 'Vigente'),
    inProgress: certificates.filter(cert => cert.status === 'En Progreso'),
    expired: certificates.filter(cert => cert.status === 'Expirado')
  }), [certificates]);

  return {
    certificates,
    groupedCertificates,
    loading,
    error,
    refetch: fetchCertificates
  };
};