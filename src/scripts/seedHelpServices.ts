import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const mockServices = [
  {
    organizationName: 'Childline 1098 Ahmedabad',
    category: 'Child Welfare',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ahmedabad',
    address: 'Near Relief Road, Paldi',
    phone: '1098',
    website: 'https://www.childlineindia.org',
    latitude: 23.0125,
    longitude: 72.5714,
    source: 'Official Database',
    verificationStatus: 'Official'
  },
  {
    organizationName: 'District Legal Services Authority (DLSA)',
    category: 'Legal Aid',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ahmedabad',
    address: 'District Court Compound, Bhadra',
    phone: '079-25501111',
    website: 'https://gslsa.gujarat.gov.in',
    latitude: 23.0245,
    longitude: 72.5810,
    source: 'Government',
    verificationStatus: 'Official'
  },
  {
    organizationName: 'Smile Foundation - Child Rights',
    category: 'NGO',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ahmedabad',
    address: 'Satellite Area, West Ahmedabad',
    phone: '9876543210',
    website: 'https://www.smilefoundationindia.org',
    latitude: 23.0315,
    longitude: 72.5115,
    source: 'NGO Directory',
    verificationStatus: 'Verified'
  },
  {
    organizationName: 'Ahmedabad Cyber Crime Police Station',
    category: 'Cyber Police',
    state: 'Gujarat',
    district: 'Ahmedabad',
    city: 'Ahmedabad',
    address: 'Shahibaug Police Headquarters',
    phone: '1930',
    website: 'https://cybercrime.gov.in',
    latitude: 23.0535,
    longitude: 72.5925,
    source: 'Government',
    verificationStatus: 'Official'
  }
];

async function seed() {
  console.log('Starting seed for Help Services...');
  try {
    const servicesRef = collection(db, 'help_services');
    for (const service of mockServices) {
      await addDoc(servicesRef, {
        ...service,
        createdAt: serverTimestamp(),
        lastVerifiedAt: serverTimestamp(),
      });
      console.log(`Added ${service.organizationName}`);
    }
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
