import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Dimensions,
  Share,
  Modal,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { generateSPPGHtml } from './pdfTemplate';
import TKPI_DATABASE from './tkpi_database.json';

// Database Yield & BDD (Bahan Dapat Dimakan) Kemenkes & Juknis BGN
const YIELD_DATABASE = {
  'beras': { bdd: 1.0, cookingYield: 2.5, category: 'Karbohidrat' },
  'singkong': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'kentang': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'ubi': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'talas': { bdd: 0.85, cookingYield: 0.95, category: 'Karbohidrat' },
  'jagung': { bdd: 0.60, cookingYield: 0.95, category: 'Karbohidrat' },
  'roti': { bdd: 1.0, cookingYield: 1.0, category: 'Karbohidrat' },
  'mie': { bdd: 1.0, cookingYield: 1.5, category: 'Karbohidrat' },
  'ayam': { bdd: 0.80, cookingYield: 0.75, category: 'Protein Hewani' },
  'daging': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
  'sapi': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
  'kambing': { bdd: 1.0, cookingYield: 0.70, category: 'Protein Hewani' },
  'ikan': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'lele': { bdd: 0.65, cookingYield: 0.80, category: 'Protein Hewani' },
  'kembung': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'bandeng': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'nila': { bdd: 0.65, cookingYield: 0.80, category: 'Protein Hewani' },
  'patin': { bdd: 0.70, cookingYield: 0.80, category: 'Protein Hewani' },
  'tuna': { bdd: 1.0, cookingYield: 0.80, category: 'Protein Hewani' },
  'salmon': { bdd: 1.0, cookingYield: 0.80, category: 'Protein Hewani' },
  'telur': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'puyuh': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'bebek': { bdd: 0.88, cookingYield: 1.0, category: 'Protein Hewani' },
  'udang': { bdd: 0.70, cookingYield: 0.85, category: 'Protein Hewani' },
  'cumi': { bdd: 0.85, cookingYield: 0.80, category: 'Protein Hewani' },
  'kerang': { bdd: 0.40, cookingYield: 0.85, category: 'Protein Hewani' },
  'tempe': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  'tahu': { bdd: 1.0, cookingYield: 0.90, category: 'Protein Nabati' },
  'kacang': { bdd: 1.0, cookingYield: 1.0, category: 'Protein Nabati' },
  'oncom': { bdd: 1.0, cookingYield: 0.95, category: 'Protein Nabati' },
  'bayam': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' },
  'kangkung': { bdd: 0.65, cookingYield: 0.60, category: 'Sayuran' },
  'wortel': { bdd: 0.85, cookingYield: 0.90, category: 'Sayuran' },
  'buncis': { bdd: 0.90, cookingYield: 0.90, category: 'Sayuran' },
  'kol': { bdd: 0.85, cookingYield: 0.85, category: 'Sayuran' },
  'brokoli': { bdd: 0.80, cookingYield: 0.85, category: 'Sayuran' },
  'sawi': { bdd: 0.85, cookingYield: 0.70, category: 'Sayuran' },
  'labu': { bdd: 0.80, cookingYield: 0.90, category: 'Sayuran' },
  'pisang': { bdd: 0.65, cookingYield: 1.0, category: 'Buah' },
  'jeruk': { bdd: 0.70, cookingYield: 1.0, category: 'Buah' },
  'semangka': { bdd: 0.60, cookingYield: 1.0, category: 'Buah' },
  'pepaya': { bdd: 0.70, cookingYield: 1.0, category: 'Buah' },
  'melon': { bdd: 0.65, cookingYield: 1.0, category: 'Buah' }
};

function getYieldInfo(nama) {
  const lowercaseNama = nama.toLowerCase();
  for (const key in YIELD_DATABASE) {
    if (lowercaseNama.includes(key)) {
      return YIELD_DATABASE[key];
    }
  }
  return { bdd: 1.0, cookingYield: 1.0, category: 'Lainnya' };
}

function getIngredientGramsPerUnit(nama, unitName) {
  const u = (unitName || '').toLowerCase().trim();
  const nameLower = (nama || '').toLowerCase();
  
  if (nameLower.includes('telur')) {
    return 60;
  } else if (nameLower.includes('jeruk')) {
    return 100;
  } else if (nameLower.includes('pisang')) {
    return 80;
  } else if (nameLower.includes('salak')) {
    return 70;
  } else if (nameLower.includes('tahu') || nameLower.includes('tempe')) {
    return 50;
  } else if (nameLower.includes('kentang') || nameLower.includes('singkong') || nameLower.includes('apel') || nameLower.includes('pear')) {
    return 150;
  }
  
  if (u.includes('butir')) return 60;
  if (u.includes('potong')) return 50;
  if (u.includes('buah')) return 100;
  
  return 100;
}

function getIngredientWeightInGrams(nama, qty, unit) {
  const q = parseFloat(qty) || 0;
  const u = (unit || '').toLowerCase().trim();
  if (u === 'g' || u === 'gram' || u === '') {
    return q;
  }
  return q * getIngredientGramsPerUnit(nama, u);
}

function calculateIngredientCost(nama, qtyPerPorsi, recipeUnit, price, priceUnit) {
  const rUnit = (recipeUnit || 'g').toLowerCase().trim();
  const pUnit = (priceUnit || 'kg').toLowerCase().trim();
  
  const yieldInfo = getYieldInfo(nama);
  const bddVal = yieldInfo.bdd || 1.0;
  const grossQty = qtyPerPorsi / bddVal;
  
  if (rUnit === pUnit) {
    return grossQty * price;
  }
  
  const isRecipeWeight = (rUnit === 'g' || rUnit === 'gram');
  const isPriceWeight = (pUnit === 'kg' || pUnit === 'liter');
  
  if (isRecipeWeight && isPriceWeight) {
    return (grossQty / 1000) * price;
  }
  
  if (isRecipeWeight && !isPriceWeight) {
    const gramsPerPiece = getIngredientGramsPerUnit(nama, pUnit);
    const piecesCount = grossQty / gramsPerPiece;
    return piecesCount * price;
  }
  
  if (!isRecipeWeight && isPriceWeight) {
    const gramsPerPiece = getIngredientGramsPerUnit(nama, rUnit);
    const grossGrams = grossQty * gramsPerPiece;
    return (grossGrams / 1000) * price;
  }
  
  return grossQty * price;
}

function getIngredientGizi(nama, qty, unit) {
  if (!nama) return { kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0 };
  
  const qtyInGrams = getIngredientWeightInGrams(nama, qty, unit);
  const cleanName = nama.split('(')[0].trim().toLowerCase();
  
  let found = TKPI_DATABASE.find(x => x.nama.toLowerCase() === cleanName);
  if (!found) {
    found = TKPI_DATABASE.find(x => x.nama.toLowerCase().includes(cleanName) || cleanName.includes(x.nama.toLowerCase()));
  }
  
  if (!found && cleanName.length > 2) {
    const words = cleanName.split(/\s+/).slice(0, 2).join(' ');
    if (words.length > 2) {
      found = TKPI_DATABASE.find(x => x.nama.toLowerCase().includes(words));
    }
  }
  
  if (!found) {
    return { kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0 };
  }
  
  const factor = qtyInGrams / 100;
  return {
    kalori: (found.kalori || 0) * factor,
    protein: (found.protein || 0) * factor,
    karbo: (found.karbo || 0) * factor,
    lemak: (found.lemak || 0) * factor,
    serat: (found.serat || 0) * factor
  };
}

// ═══════════════════════════════════════════════════
//  DATA MENU AWAL (TKPI KEMENKES + NEW MBG RECIPES)
// ═══════════════════════════════════════════════════
const INITIAL_MENU_DATA = {
  karbo: [
    { id: 'nasi', icon: 'rice', nama: 'Nasi', porsi: '100g nasi matang', kalori: 180, protein: 3, karbo: 39.8, lemak: 0.3, serat: 0.2, harga: 600, mbgStatus: 'aman', mbgNotes: 'Bahan pangan segar Kemenkes TKPI (Serealia).' },
    { id: 'nasi-merah', icon: 'bowl-rice', nama: 'Nasi Merah', porsi: '100g beras merah', kalori: 352, protein: 7.5, karbo: 76.2, lemak: 1.7, serat: 3.2, harga: 1700, mbgStatus: 'aman', mbgNotes: 'Kaya serat dan vitamin B kompleks.' },
    { id: 'nasi-jagung', icon: 'corn', nama: 'Nasi Jagung Pipil', porsi: '90g beras + jagung', kalori: 345, protein: 8.0, karbo: 75.0, lemak: 1.3, serat: 2.6, harga: 1100, mbgStatus: 'aman', mbgNotes: 'Variasi karbohidrat lokal berserat.' },
    { id: 'singkong', icon: 'potato', nama: 'Singkong Kukus', porsi: '150g singkong mentah', kalori: 230, protein: 1.8, karbo: 56.0, lemak: 0.4, serat: 2.4, harga: 800, mbgStatus: 'aman', mbgNotes: 'Pemberdayaan pangan petani singkong lokal.' },
    { id: 'kentang', icon: 'food-potato', nama: 'Kentang Kukus', porsi: '200g kentang mentah', kalori: 168, protein: 4.0, karbo: 38.2, lemak: 0.2, serat: 3.6, harga: 1500, mbgStatus: 'aman', mbgNotes: 'Karbohidrat segar kaya potasium.' },
    { id: 'lontong', icon: 'ellipse', nama: 'Lontong Daun', porsi: '150g lontong siap saji', kalori: 210, protein: 3.5, karbo: 47.0, lemak: 0.6, serat: 0.8, harga: 1000, mbgStatus: 'aman', mbgNotes: 'Karbohidrat lokal dibungkus daun pisang.' },
  ],
  protein: [
    { id: 'chicken-katsu', icon: 'food-chicken', nama: 'Chicken Katsu Fillet', porsi: '80g dada ayam mentah', kalori: 220, protein: 18.5, karbo: 8.2, lemak: 12.0, serat: 0, harga: 3800, mbgStatus: 'aman', mbgNotes: 'Ayam dada segar dilumuri tepung panir buatan sendiri.' },
    { id: 'ayam-goreng', icon: 'poultry-leg', nama: 'Ayam Goreng Lengkuas', porsi: '90g ayam potongan', kalori: 240, protein: 19.0, karbo: 2.0, lemak: 16.8, serat: 0, harga: 3600, mbgStatus: 'aman', mbgNotes: 'Lauk ayam segar bumbu rempah tradisional.' },
    { id: 'telur-ceplok', icon: 'egg-fried', nama: 'Telur Dadar Sayur', porsi: '1 butir telur ayam (60g)', kalori: 125, protein: 8.5, karbo: 1.5, lemak: 9.5, serat: 0.2, harga: 2000, mbgStatus: 'aman', mbgNotes: 'Sumber protein hewani murah dan praktis.' },
    { id: 'telur-balado', icon: 'egg', nama: 'Telur Balado Matang', porsi: '1 butir telur ayam (60g)', kalori: 110, protein: 7.5, karbo: 1.0, lemak: 8.0, serat: 0, harga: 1200, mbgStatus: 'aman', mbgNotes: 'Telur ayam rebus matang bersambal tomat (non-kolesterol puyuh).' },
    { id: 'ayam-suwir-semur', icon: 'poultry-leg', nama: 'Ayam Suwir Kecap', porsi: '60g ayam tanpa tulang', kalori: 150, protein: 13.8, karbo: 3.0, lemak: 9.0, serat: 0, harga: 2800, mbgStatus: 'aman', mbgNotes: 'Praktis dikonsumsi dan mudah dibagi rata ke piring anak.' },
    { id: 'ikan-nila-bakar', icon: 'fish', nama: 'Ikan Nila Panggang', porsi: '80g ikan nila mentah', kalori: 120, protein: 16.0, karbo: 0, lemak: 6.0, serat: 0, harga: 3200, mbgStatus: 'aman', mbgNotes: 'Ikan air tawar lokal segar kaya asam lemak baik.' },
    { id: 'nugget-homemade', icon: 'food-chicken', nama: 'Nugget Ayam Homemade', porsi: '60g adonan olahan katering', kalori: 140, protein: 11.0, karbo: 8.0, lemak: 7.0, serat: 0.5, harga: 2200, mbgStatus: 'aman', mbgNotes: 'Buatan dapur sendiri (non-pabrikan UPF), dijamin sehat.' },
    { id: 'perkedel-tahu', icon: 'square-outline', nama: 'Perkedel Tahu Wortel', porsi: '60g adonan tahu', kalori: 95, protein: 6.5, karbo: 5.0, lemak: 5.5, serat: 0.8, harga: 800, mbgStatus: 'aman', mbgNotes: 'Protein nabati kaya serat dari tahu segar dan wortel parut.' },
    { id: 'tempe-bacem', icon: 'square', nama: 'Tempe Bacem Bakar', porsi: '75g tempe kedelai', kalori: 165, protein: 12.1, karbo: 9.6, lemak: 8.8, serat: 2.4, harga: 900, mbgStatus: 'aman', mbgNotes: 'Protein nabati khas lokal kaya serat pangan.' },
    { id: 'tahu-balado', icon: 'square-outline', nama: 'Tahu Sutra Balado', porsi: '100g tahu putih basah', kalori: 110, protein: 8.2, karbo: 2.8, lemak: 7.2, serat: 0.6, harga: 800, mbgStatus: 'aman', mbgNotes: 'Tahu putih segar kaya kalsium.' },
    { id: 'ikan-kembung', icon: 'fish', nama: 'Ikan Kembung Goreng', porsi: '80g daging ikan segar', kalori: 160, protein: 18.8, karbo: 0, lemak: 8.9, serat: 0, harga: 2600, mbgStatus: 'aman', mbgNotes: 'Kandungan Omega-3 sangat tinggi, bagus untuk otak.' },
    { id: 'daging-suwir', icon: 'food-steak', nama: 'Empal Daging Suwir', porsi: '50g daging sapi', kalori: 145, protein: 13.5, karbo: 0.5, lemak: 9.8, serat: 0, harga: 4200, mbgStatus: 'aman', mbgNotes: 'Daging sapi lokal kaya zat besi.' },
    { id: 'telur-puyuh', icon: 'egg', nama: 'Sate Telur Puyuh', porsi: '4 butir telur puyuh', kalori: 135, protein: 10.2, karbo: 0.8, lemak: 10.1, serat: 0, harga: 2400, mbgStatus: 'dibatasi', mbgNotes: 'Tinggi kolesterol jenuh. Batasi konsumsi berkala.' },
  ],
  sayur: [
    { id: 'tumis-buncis', icon: 'carrot', nama: 'Tumis Buncis Wortel', porsi: '70g buncis + wortel', kalori: 48, protein: 1.6, karbo: 8.2, lemak: 1.8, serat: 2.2, harga: 600, mbgStatus: 'aman', mbgNotes: 'Sayur segar tumis minyak kelapa.' },
    { id: 'bayam', icon: 'leaf', nama: 'Sayur Bening Bayam', porsi: '80g daun bayam segar', kalori: 28, protein: 2.2, karbo: 4.5, lemak: 0.3, serat: 1.8, harga: 500, mbgStatus: 'aman', mbgNotes: 'Bening bayam jagung manis segar.' },
    { id: 'sayur-asem', icon: 'pot-steam', nama: 'Sayur Asem Jakarta', porsi: '100g kuah & sayuran', kalori: 45, protein: 1.2, karbo: 9.5, lemak: 0.5, serat: 1.8, harga: 600, mbgStatus: 'aman', mbgNotes: 'Sayur asem segar tradisional lokal.' },
    { id: 'cah-kangkung-bakso', icon: 'sprout', nama: 'Cah Kangkung Bakso', porsi: '80g kangkung & bakso', kalori: 65, protein: 3.5, karbo: 4.0, lemak: 3.8, serat: 1.2, harga: 850, mbgStatus: 'aman', mbgNotes: 'Kangkung tumis dengan irisan bakso sapi UMKM lokal.' },
    { id: 'sup-wortel-kentang', icon: 'pot-steam', nama: 'Sup Wortel Kentang Buncis', porsi: '100g sup kuah bening', kalori: 50, protein: 1.4, karbo: 11.0, lemak: 0.2, serat: 2.2, harga: 700, mbgStatus: 'aman', mbgNotes: 'Aneka sayur sup segar kaya serat dan cairan.' },
    { id: 'orek-tempe', icon: 'square', nama: 'Orek Tempe Basah', porsi: '50g tempe potong dadu', kalori: 90, protein: 6.0, karbo: 5.0, lemak: 5.0, serat: 0.8, harga: 500, mbgStatus: 'aman', mbgNotes: 'Tempe potong dadu tumis kecap manis bawang putih.' },
    { id: 'capcay', icon: 'silverware-clean', nama: 'Capcay Bakso Sayur', porsi: '80g kembang kol+wortel', kalori: 65, protein: 2.5, karbo: 7.8, lemak: 2.4, serat: 2.5, harga: 750, mbgStatus: 'aman', mbgNotes: 'Sayuran campur dengan bakso sapi lokal.' },
    { id: 'sayur-sop', icon: 'pot-steam', nama: 'Sayur Sop Makaroni', porsi: '90g kentang+wortel', kalori: 42, protein: 1.8, karbo: 8.0, lemak: 0.5, serat: 2.0, harga: 550, mbgStatus: 'aman', mbgNotes: 'Sup kaldu dengan sayur dan makaroni.' },
    { id: 'kangkung', icon: 'sprout', nama: 'Cah Kangkung Tauco', porsi: '80g kangkung basah', kalori: 38, protein: 2.8, karbo: 4.6, lemak: 1.2, serat: 2.0, harga: 500, mbgStatus: 'aman', mbgNotes: 'Kangkung tumis tauco segar.' },
    { id: 'labu-siam', icon: 'shaker-outline', nama: 'Labu Siam Santan', porsi: '100g labu siam', kalori: 45, protein: 1.0, karbo: 5.0, lemak: 2.5, serat: 1.4, harga: 550, mbgStatus: 'aman', mbgNotes: 'Labu siam kuah santan encer.' },
  ],
  buah: [
    { id: 'pisang', icon: 'food-apple', nama: 'Pisang Ambon', porsi: '1 buah sedang (80g)', kalori: 78, protein: 1.0, karbo: 20.0, lemak: 0.2, serat: 2.0, harga: 700, mbgStatus: 'aman', mbgNotes: 'Sangat baik untuk pencernaan dan energi instan.' },
    { id: 'jeruk', icon: 'fruit-citrus', nama: 'Jeruk Manis Lokal', porsi: '1 buah sedang (100g)', kalori: 48, protein: 0.9, karbo: 11.8, lemak: 0.1, serat: 2.2, harga: 900, mbgStatus: 'aman', mbgNotes: 'Kaya vitamin C untuk imunitas anak.' },
    { id: 'semangka', icon: 'fruit-watermelon', nama: 'Semangka Potong', porsi: '150g irisan buah', kalori: 45, protein: 0.8, karbo: 11.2, lemak: 0.2, serat: 0.6, harga: 600, mbgStatus: 'aman', mbgNotes: 'Sangat menyegarkan dan kaya air.' },
    { id: 'pepaya', icon: 'fruit-pear', nama: 'Pepaya California', porsi: '120g irisan buah', kalori: 55, protein: 0.6, karbo: 14.0, lemak: 0.1, serat: 1.9, harga: 500, mbgStatus: 'aman', mbgNotes: 'Melancarkan pencernaan anak, manis alami.' },
    { id: 'melon', icon: 'fruit-grapes', nama: 'Melon Hijau', porsi: '120g irisan buah', kalori: 42, protein: 0.8, karbo: 10.5, lemak: 0.1, serat: 1.2, harga: 800, mbgStatus: 'aman', mbgNotes: 'Melon hijau segar.' },
  ],
};

// Detailed sub-ingredients mapping for local school menus
const RECIPE_BREAKDOWNS = {
  'nasi': [
    { nama: 'Beras (untuk nasi)', qty: 45, unit: 'g', harga: 600 }
  ],
  'nasi-merah': [
    { nama: 'Beras Merah (untuk nasi)', qty: 80, unit: 'g', harga: 1700 }
  ],
  'nasi-jagung': [
    { nama: 'Beras Jagung', qty: 90, unit: 'g', harga: 1100 }
  ],
  'singkong': [
    { nama: 'Singkong Mentah', qty: 150, unit: 'g', harga: 800 }
  ],
  'kentang': [
    { nama: 'Kentang Mentah', qty: 200, unit: 'g', harga: 1500 }
  ],
  'lontong': [
    { nama: 'Lontong Daun', qty: 150, unit: 'g', harga: 1000 }
  ],
  'chicken-katsu': [
    { nama: 'Chicken Katsu (Fillet)', qty: 100, unit: 'g fillet', harga: 4000, isMain: true },
    { nama: 'Tepung terigu', qty: 15, unit: 'g', harga: 0 },
    { nama: 'Tepung roti', qty: 20, unit: 'g', harga: 0 },
    { nama: 'Telur coating', qty: 0.25, unit: 'butir', harga: 0 }
  ],
  'ayam-goreng': [
    { nama: 'Ayam Goreng Lengkuas', qty: 90, unit: 'g', harga: 3600, isMain: true }
  ],
  'telur-ceplok': [
    { nama: 'Telur Ayam Segar', qty: 1, unit: 'butir', harga: 2000, isMain: true }
  ],
  'telur-balado': [
    { nama: 'Telur Ayam Segar', qty: 1, unit: 'butir', harga: 1200, isMain: true }
  ],
  'ayam-suwir-semur': [
    { nama: 'Ayam Suwir Kecap', qty: 60, unit: 'g', harga: 2800, isMain: true }
  ],
  'ikan-nila-bakar': [
    { nama: 'Ikan Nila Segar', qty: 80, unit: 'g', harga: 3200, isMain: true }
  ],
  'nugget-homemade': [
    { nama: 'Nugget Homemade', qty: 60, unit: 'g', harga: 2200, isMain: true }
  ],
  'perkedel-tahu': [
    { nama: 'Tahu Putih Segar', qty: 50, unit: 'g', harga: 800, isMain: true }
  ],
  'tempe-bacem': [
    { nama: 'Tempe Kedelai', qty: 75, unit: 'g', harga: 900, isMain: true }
  ],
  'tahu-balado': [
    { nama: 'Tahu Putih', qty: 100, unit: 'g', harga: 800, isMain: true }
  ],
  'ikan-kembung': [
    { nama: 'Ikan Kembung Segar', qty: 80, unit: 'g', harga: 2600, isMain: true }
  ],
  'daging-suwir': [
    { nama: 'Daging Sapi Lokal', qty: 50, unit: 'g', harga: 4200, isMain: true }
  ],
  'telur-puyuh': [
    { nama: 'Telur Puyuh', qty: 4, unit: 'butir', harga: 2400, isMain: true }
  ],
  'tumis-buncis': [
    { nama: 'Buncis Segar', qty: 50, unit: 'g', harga: 600, isMain: true },
    { nama: 'Wortel Segar', qty: 20, unit: 'g', harga: 0 }
  ],
  'bayam': [
    { nama: 'Daun Bayam Segar', qty: 60, unit: 'g', harga: 500, isMain: true },
    { nama: 'Jagung Pipil', qty: 20, unit: 'g', harga: 0 }
  ],
  'sayur-asem': [
    { nama: 'Sayur Asem Jakarta', qty: 100, unit: 'g', harga: 600, isMain: true }
  ],
  'cah-kangkung-bakso': [
    { nama: 'Cah Kangkung Bakso', qty: 65, unit: 'g', harga: 850, isMain: true },
    { nama: 'Bakso Sapi', qty: 15, unit: 'g', harga: 0 }
  ],
  'sup-wortel-kentang': [
    { nama: 'Sup Wortel Kentang Buncis', qty: 80, unit: 'g', harga: 700, isMain: true },
    { nama: 'Buncis', qty: 20, unit: 'g', harga: 0 }
  ],
  'orek-tempe': [
    { nama: 'Orek Tempe Basah', qty: 50, unit: 'g', harga: 500, isMain: true }
  ],
  'capcay': [
    { nama: 'Capcay Bakso Sayur', qty: 65, unit: 'g', harga: 750, isMain: true },
    { nama: 'Bakso Sapi', qty: 15, unit: 'g', harga: 0 }
  ],
  'sayur-sop': [
    { nama: 'Sayur Sop Makaroni', qty: 70, unit: 'g', harga: 550, isMain: true },
    { nama: 'Makaroni', qty: 20, unit: 'g', harga: 0 }
  ],
  'kangkung': [
    { nama: 'Cah Kangkung Tauco', qty: 80, unit: 'g', harga: 500, isMain: true }
  ],
  'labu-siam': [
    { nama: 'Labu Siam Santan', qty: 100, unit: 'g', harga: 550, isMain: true }
  ],
  'pisang': [
    { nama: 'Pisang', qty: 1, unit: 'buah', harga: 500, isMain: true }
  ],
  'jeruk': [
    { nama: 'Jeruk', qty: 1, unit: 'buah', harga: 900, isMain: true }
  ],
  'semangka': [
    { nama: 'Semangka', qty: 1, unit: 'potong', harga: 600, isMain: true }
  ],
  'pepaya': [
    { nama: 'Pepaya', qty: 1, unit: 'potong', harga: 500, isMain: true }
  ],
  'melon': [
    { nama: 'Melon', qty: 1, unit: 'potong', harga: 800, isMain: true }
  ]
};

const DEFAULT_INGREDIENT_PRICES = {
  'Beras': { price: 15000, unit: 'kg' },
  'Beras Merah': { price: 18000, unit: 'kg' },
  'Beras Jagung': { price: 16000, unit: 'kg' },
  'Singkong Mentah': { price: 8000, unit: 'kg' },
  'Kentang Mentah': { price: 18000, unit: 'kg' },
  'Beras (Lontong)': { price: 15000, unit: 'kg' },
  
  'Ayam (Chicken fillet katsu)': { price: 60000, unit: 'kg' },
  'Tepung terigu (coating)': { price: 12000, unit: 'kg' },
  'Tepung roti / breadcrumb': { price: 22000, unit: 'kg' },
  'Telur (coating)': { price: 2000, unit: 'butir' },
  'Minyak goreng (deep fry tambahan)': { price: 16000, unit: 'liter' },
  
  'Ayam Potongan': { price: 55000, unit: 'kg' },
  'Lengkuas parut': { price: 15000, unit: 'kg' },
  'Minyak goreng (deep fry)': { price: 16000, unit: 'liter' },
  'Daun salam & sereh': { price: 200, unit: 'buah' },
  
  'Telur Ayam Segar': { price: 2000, unit: 'butir' },
  'Minyak goreng (frying)': { price: 16000, unit: 'liter' },
  'Daun bawang (iris)': { price: 12000, unit: 'kg' },
  
  'Cabe merah keriting': { price: 45000, unit: 'kg' },
  'Tomat merah segar': { price: 15000, unit: 'kg' },
  'Minyak goreng': { price: 16000, unit: 'liter' },
  
  'Daging Ayam Fillet': { price: 60000, unit: 'kg' },
  'Kecap manis lokal': { price: 18000, unit: 'liter' },
  
  'Ikan Nila Segar': { price: 38000, unit: 'kg' },
  'Kecap & madu oles': { price: 40000, unit: 'liter' },
  'Minyak goreng (oles)': { price: 16000, unit: 'liter' },
  'Kunyit & jahe bumbu': { price: 20000, unit: 'kg' },
  
  'Daging Ayam Cincang': { price: 60000, unit: 'kg' },
  'Tepung terigu & panir': { price: 18000, unit: 'kg' },
  'Telur ayam (adonan)': { price: 2000, unit: 'butir' },
  
  'Tahu Putih Segar': { price: 10000, unit: 'kg' },
  'Wortel serut': { price: 14000, unit: 'kg' },
  
  'Tempe Kedelai Segar': { price: 12000, unit: 'kg' },
  'Gula merah lokal': { price: 22000, unit: 'kg' },
  'Air kelapa': { price: 5000, unit: 'liter' },
  'Kecap manis': { price: 18000, unit: 'liter' },
  
  'Tahu Sutra Basah': { price: 12000, unit: 'kg' },
  
  'Ikan Kembung Segar': { price: 40000, unit: 'kg' },
  'Kunyit & ketumbar bubuk': { price: 30000, unit: 'kg' },
  
  'Daging Sapi Lokal': { price: 130000, unit: 'kg' },
  'Santan kelapa encer': { price: 15000, unit: 'liter' },
  'Gula merah & kecap': { price: 20000, unit: 'kg' },
  
  'Telur Puyuh Segar': { price: 400, unit: 'butir' },
  'Tusuk sate bambu': { price: 100, unit: 'buah' },
  
  'Sayuran (total)': { price: 12000, unit: 'kg' },
  'Tempe Papan Segar': { price: 12000, unit: 'kg' },
  
  'Pisang Ambon': { price: 2000, unit: 'buah' },
  'Jeruk Manis Lokal': { price: 1800, unit: 'buah' },
  'Semangka Merah Segar': { price: 8000, unit: 'kg' },
  'Pepaya California Segar': { price: 8000, unit: 'kg' },
  'Melon Hijau Segar': { price: 14000, unit: 'kg' },
  
  'Minyak goreng': { price: 16000, unit: 'liter' },
  'Garam': { price: 8000, unit: 'kg' },
  'Gula pasir': { price: 18000, unit: 'kg' },
  'Bawang merah': { price: 40000, unit: 'kg' },
  'Bawang putih': { price: 35000, unit: 'kg' }
};

// Detailed recipe mapping for each menu item to display complete logs
const RECIPE_DETAILS = {
  // Karbo
  'nasi': {
    utama: { nama: 'Beras', qty: 45, unit: 'g', catatan: 'Nasi matang ±100g/porsi' }
  },
  'nasi-merah': {
    utama: { nama: 'Beras Merah', qty: 80, unit: 'g', catatan: 'Nasi merah matang ±180g/porsi' }
  },
  'nasi-jagung': {
    utama: { nama: 'Beras Jagung', qty: 90, unit: 'g', catatan: 'Variasi karbo berserat tinggi' }
  },
  'singkong': {
    utama: { nama: 'Singkong Mentah', qty: 150, unit: 'g', catatan: 'Kukus empuk potong dadu' }
  },
  'kentang': {
    utama: { nama: 'Kentang Mentah', qty: 200, unit: 'g', catatan: 'Kentang kukus/rebus kulit kupas' }
  },
  'lontong': {
    utama: { nama: 'Beras (Lontong)', qty: 70, unit: 'g', catatan: 'Dibungkus daun pisang segar' }
  },

  // Protein
  'chicken-katsu': {
    utama: { nama: 'Ayam (Chicken fillet katsu)', qty: 100, unit: 'g', catatan: 'Fillet utuh dipukul tipis, dilumuri tepung-telur-breadcrumb lalu goreng deep fry.' },
    pelengkapType: 'KATSU / GORENG',
    pelengkap: [
      { nama: 'Tepung terigu (coating)', qty: 15, unit: 'g' },
      { nama: 'Tepung roti / breadcrumb', qty: 20, unit: 'g' },
      { nama: 'Telur (coating)', qty: 0.25, unit: 'butir' },
      { nama: 'Minyak goreng (deep fry tambahan)', qty: 40, unit: 'ml' }
    ]
  },
  'ayam-goreng': {
    utama: { nama: 'Ayam Potongan', qty: 100, unit: 'g', catatan: 'Ayam bumbu ungkep lengkuas lalu goreng.' },
    pelengkapType: 'UNGKEP / GORENG',
    pelengkap: [
      { nama: 'Lengkuas parut', qty: 15, unit: 'g' },
      { nama: 'Minyak goreng (deep fry)', qty: 35, unit: 'ml' },
      { nama: 'Daun salam & sereh', qty: 0.5, unit: 'lbr' }
    ]
  },
  'telur-ceplok': {
    utama: { nama: 'Telur Ayam Segar', qty: 1, unit: 'butir', catatan: 'Telur dadar/ceplok matang sempurna.' },
    pelengkapType: 'GORENG MATANG',
    pelengkap: [
      { nama: 'Minyak goreng (frying)', qty: 15, unit: 'ml' },
      { nama: 'Daun bawang (iris)', qty: 5, unit: 'g' }
    ]
  },
  'telur-balado': {
    utama: { nama: 'Telur Ayam Segar', qty: 1, unit: 'butir', catatan: 'Telur rebus dikupas kulit lalu digoreng kilat dan disambal.' },
    pelengkapType: 'REBUS / BALADO',
    pelengkap: [
      { nama: 'Cabe merah keriting', qty: 15, unit: 'g' },
      { nama: 'Tomat merah segar', qty: 10, unit: 'g' },
      { nama: 'Minyak goreng', qty: 15, unit: 'ml' }
    ]
  },
  'ayam-suwir-semur': {
    utama: { nama: 'Daging Ayam Fillet', qty: 80, unit: 'g', catatan: 'Rebus matang lalu suwir kasar dan masak semur manis.' },
    pelengkapType: 'SEMUR / TUMIS',
    pelengkap: [
      { nama: 'Kecap manis lokal', qty: 12, unit: 'ml' },
      { nama: 'Minyak goreng', qty: 10, unit: 'ml' }
    ]
  },
  'ikan-nila-bakar': {
    utama: { nama: 'Ikan Nila Segar', qty: 120, unit: 'g', catatan: 'Ikan nila utuh/fillet bumbu kuning panggang/bakar.' },
    pelengkapType: 'PANGGANG / BAKAR',
    pelengkap: [
      { nama: 'Kecap & madu oles', qty: 10, unit: 'ml' },
      { nama: 'Minyak goreng (oles)', qty: 5, unit: 'ml' },
      { nama: 'Kunyit & jahe bumbu', qty: 5, unit: 'g' }
    ]
  },
  'nugget-homemade': {
    utama: { nama: 'Daging Ayam Cincang', qty: 60, unit: 'g', catatan: 'Adonan nugget kukus homemade non-UPF lalu digoreng tepung.' },
    pelengkapType: 'HOMEMADE NUGGET',
    pelengkap: [
      { nama: 'Tepung terigu & panir', qty: 15, unit: 'g' },
      { nama: 'Telur ayam (adonan)', qty: 0.1, unit: 'butir' },
      { nama: 'Minyak goreng (frying)', qty: 25, unit: 'ml' }
    ]
  },
  'perkedel-tahu': {
    utama: { nama: 'Tahu Putih Segar', qty: 60, unit: 'g', catatan: 'Tahu haluskan campur wortel serut & telur lalu goreng.' },
    pelengkapType: 'GORENG / ADONAN',
    pelengkap: [
      { nama: 'Wortel serut', qty: 10, unit: 'g' },
      { nama: 'Telur ayam (adonan)', qty: 0.1, unit: 'butir' },
      { nama: 'Minyak goreng (frying)', qty: 15, unit: 'ml' }
    ]
  },
  'tempe-bacem': {
    utama: { nama: 'Tempe Kedelai Segar', qty: 75, unit: 'g', catatan: 'Tempe rebus bumbu kelapa + gula merah lalu bakar oles kecap.' },
    pelengkapType: 'BACEM / BAKAR',
    pelengkap: [
      { nama: 'Gula merah lokal', qty: 10, unit: 'g' },
      { nama: 'Air kelapa', qty: 30, unit: 'ml' },
      { nama: 'Kecap manis', qty: 5, unit: 'ml' }
    ]
  },
  'tahu-balado': {
    utama: { nama: 'Tahu Sutra Basah', qty: 100, unit: 'g', catatan: 'Tahu putih segar goreng setengah matang lalu siram balado.' },
    pelengkapType: 'GORENG / BALADO',
    pelengkap: [
      { nama: 'Minyak goreng', qty: 15, unit: 'ml' },
      { nama: 'Cabe merah keriting', qty: 10, unit: 'g' }
    ]
  },
  'ikan-kembung': {
    utama: { nama: 'Ikan Kembung Segar', qty: 100, unit: 'g', catatan: 'Ikan kembung bumbu kunyit ketumbar goreng garing.' },
    pelengkapType: 'GORENG REMPAH',
    pelengkap: [
      { nama: 'Minyak goreng (deep fry)', qty: 35, unit: 'ml' },
      { nama: 'Kunyit & ketumbar bubuk', qty: 4, unit: 'g' }
    ]
  },
  'daging-suwir': {
    utama: { nama: 'Daging Sapi Lokal', qty: 60, unit: 'g', catatan: 'Daging sapi rebus suwir bumbu empal manis rempah.' },
    pelengkapType: 'EMPAL / SUWIR',
    pelengkap: [
      { nama: 'Santan kelapa encer', qty: 20, unit: 'ml' },
      { nama: 'Gula merah & kecap', qty: 8, unit: 'g' },
      { nama: 'Minyak goreng', qty: 10, unit: 'ml' }
    ]
  },
  'telur-puyuh': {
    utama: { nama: 'Telur Puyuh Segar', qty: 4, unit: 'butir', catatan: 'Telur puyuh rebus kupas dibumbu kecap sate.' },
    pelengkapType: 'BACEM SATE',
    pelengkap: [
      { nama: 'Kecap manis', qty: 8, unit: 'ml' },
      { nama: 'Tusuk sate bambu', qty: 1, unit: 'tusuk' }
    ]
  },

  // Sayur
  'tumis-buncis': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'bayam': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'sayur-asem': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'cah-kangkung-bakso': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'sup-wortel-kentang': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'orek-tempe': {
    utama: { nama: 'Tempe Papan Segar', qty: 50, unit: 'g', catatan: 'Tempe potong kecil tumis bumbu manis.' }
  },
  'capcay': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'sayur-sop': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'kangkung': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },
  'labu-siam': {
    utama: { nama: 'Sayuran (total)', qty: 100, unit: 'g', catatan: 'Bayam / buncis / wortel dll.' }
  },

  // Buah
  'pisang': {
    utama: { nama: 'Pisang Ambon', qty: 1, unit: 'buah', catatan: 'Pisang matang berukuran sedang' }
  },
  'jeruk': {
    utama: { nama: 'Jeruk Manis Lokal', qty: 1, unit: 'buah', catatan: 'Jeruk peras / kupas manis segar' }
  },
  'semangka': {
    utama: { nama: 'Semangka Merah Segar', qty: 1, unit: 'potong', catatan: 'Potong segitiga tanpa biji' }
  },
  'pepaya': {
    utama: { nama: 'Pepaya California Segar', qty: 1, unit: 'potong', catatan: 'Pepaya kupas potong persegi' }
  },
  'melon': {
    utama: { nama: 'Melon Hijau Segar', qty: 1, unit: 'potong', catatan: 'Melon manis segar kupas kulit' }
  }
};

// Data Standar Gizi Porsi Makan MBG Resmi Badan Gizi Nasional (Juknis Final Juni 2025)
const AKG_DATA = {
  'balita': { name: 'Anak Balita', kal: 342, pctAkg: 24.4, protein: 47.6, lemak: 21.6, karbo: 20.6, waktu: 'Makan Pagi', rujukan: '20-25% AKG' },
  'paud': { name: 'Siswa TK/PAUD/RA', kal: 328, pctAkg: 23.4, protein: 25.0, lemak: 23.7, karbo: 20.9, waktu: 'Makan Pagi', rujukan: '20-25% AKG' },
  'sd_kecil': { name: 'Siswa SD/MI (Kelas 1-3)', kal: 368.8, pctAkg: 22.3, protein: 23.1, lemak: 24.1, karbo: 20.1, waktu: 'Makan Pagi', rujukan: '20-25% AKG' },
  'sd_besar': { name: 'Siswa SD/MI (Kelas 4-6)', kal: 531, pctAkg: 32.2, protein: 33.1, lemak: 30.9, karbo: 31.0, waktu: 'Makan Siang', rujukan: '30-35% AKG' },
  'smp': { name: 'Siswa SMP/MTs Sederajat', kal: 719, pctAkg: 32.3, protein: 34.8, lemak: 30.7, karbo: 30.8, waktu: 'Makan Siang', rujukan: '30-35% AKG' },
  'sma': { name: 'Siswa SMA/MA/SMK Sederajat', kal: 762.5, pctAkg: 32.1, protein: 36.4, lemak: 31.0, karbo: 30.4, waktu: 'Makan Siang', rujukan: '30-35% AKG' },
  'bumil': { name: 'Ibu Hamil', kal: 818, pctAkg: 33.3, protein: 40.4, lemak: 32.1, karbo: 31.9, waktu: 'Makan Siang', rujukan: '30-35% AKG' },
  'busui': { name: 'Ibu Menyusui', kal: 818, pctAkg: 31.9, protein: 52.9, lemak: 32.2, karbo: 30.8, waktu: 'Makan Siang', rujukan: '30-35% AKG' },
  'slb': { name: 'Siswa SLB (Menyesuaikan Usia)', kal: 531, pctAkg: 32.2, protein: 33.1, lemak: 30.9, karbo: 31.0, waktu: 'Makan Siang', rujukan: 'Sesuai kelompok usia' }
};

export default function App() {
  const [activeTab, setActiveTab] = useState(1);
  
  // Setup Parameters
  const [jmlSiswa, setJmlSiswa] = useState('150');
  const [usia, setUsia] = useState('sd_besar');
  const [spareMode, setSpareMode] = useState('fix'); // 'fix' or 'pct'
  const [spareVal, setSpareVal] = useState('15');
  const [budget, setBudget] = useState('10000');
  const [overhead, setOverhead] = useState(25); // percentage
  const [jamMakanSiang, setJamMakanSiang] = useState('11:30'); // target lunchtime

  // Gizsee Calculator States
  const [calculatorRows, setCalculatorRows] = useState([
    { id: '1', nama: '', berat: '', kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0, baseKalori: 0, baseProtein: 0, baseKarbo: 0, baseLemak: 0, baseSerat: 0, mbgStatus: 'aman', mbgNotes: '', icon: 'rice', kat: '' }
  ]);
  const [calculatorHistory, setCalculatorHistory] = useState([]);
  const [tkpiModalMode, setTkpiModalMode] = useState('custom_menu'); // 'custom_menu' or 'calculator'
  const [activeRowIndexForSearch, setActiveRowIndexForSearch] = useState(null);
  const [calcTargetUsia, setCalcTargetUsia] = useState('sd_besar');

  // Claude AI States
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [aiIngredients, setAiIngredients] = useState([]);

  // Dynamic Back-Scheduling helper
  const calculateTimeline = (jamMakan) => {
    try {
      const [h, m] = jamMakan.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) throw new Error('Invalid time format');
      
      const makeTimeString = (hour, min) => {
        let hr = (hour + 24) % 24;
        let mn = (min + 60) % 60;
        return `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
      };

      return {
        makanSiang: makeTimeString(h, m),
        distribusi: makeTimeString(h - 1, m),
        pemorsian: makeTimeString(h - 2, m),
        mulaiMasak: makeTimeString(h - 4, m),
        batasAman: makeTimeString(h - 2 + 3, m)
      };
    } catch (e) {
      return {
        makanSiang: '11:30',
        distribusi: '10:30',
        pemorsian: '09:30',
        mulaiMasak: '07:30',
        batasAman: '12:30'
      };
    }
  };

  // Selection state
  const [selected, setSelected] = useState({ karbo: [], protein: [], sayur: [], buah: [] });
  const [customMenus, setCustomMenus] = useState([]);
  const [deletedMenuIds, setDeletedMenuIds] = useState([]);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [menuPrices, setMenuPrices] = useState({});
  const [categoriesList, setCategoriesList] = useState(['karbo', 'protein', 'sayur', 'buah']);

  // Dropdown & Kategori Baru States
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  // Input states for new custom menu
  const [customIcon, setCustomIcon] = useState('');
  const [customNama, setCustomNama] = useState('');
  const [customKat, setCustomKat] = useState('protein');
  const [customKalori, setCustomKalori] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customKarbo, setCustomKarbo] = useState('');
  const [customLemak, setCustomLemak] = useState('');
  const [customSerat, setCustomSerat] = useState('');
  const [customHarga, setCustomHarga] = useState('');
  const [customMbgStatus, setCustomMbgStatus] = useState('aman');
  const [customMbgNotes, setCustomMbgNotes] = useState('');

  // Custom Recipe Builder State
  const [customIngredients, setCustomIngredients] = useState([{ nama: '', qty: '', unit: 'g', catatan: '' }]);
  const [customRecipeDetails, setCustomRecipeDetails] = useState({});

  // Central Recipe & Raw Ingredient Prices Database States
  const [recipeDetails, setRecipeDetails] = useState(RECIPE_DETAILS);
  const [ingredientPrices, setIngredientPrices] = useState(DEFAULT_INGREDIENT_PRICES);

  // Active Recipe Editor Modal States
  const [editingItem, setEditingItem] = useState(null);
  const [editRecipeUtama, setEditRecipeUtama] = useState({ nama: '', qty: '', unit: 'g', catatan: '' });
  const [editRecipePelengkap, setEditRecipePelengkap] = useState([]);
  const [editIngredientPrices, setEditIngredientPrices] = useState({});

  // QC & Food Safety State
  const [qcRasa, setQcRasa] = useState(false);
  const [qcAroma, setQcAroma] = useState(false);
  const [qcTekstur, setQcTekstur] = useState(false);
  const [qcPenampilan, setQcPenampilan] = useState(false);
  const [qcHigienitas, setQcHigienitas] = useState(false);
  const [qcSuhu, setQcSuhu] = useState(false);
  const [qcWaktu, setQcWaktu] = useState(false);
  const [qcTesterName, setQcTesterName] = useState('');
  const [qcNotes, setQcNotes] = useState('');
  const [qcStatus, setQcStatus] = useState('layak');

  // TKPI Modal & Search state
  const [showTkpiModal, setShowTkpiModal] = useState(false);
  const [tkpiSearchQuery, setTkpiSearchQuery] = useState('');
  const [selectedTkpiItem, setSelectedTkpiItem] = useState(null);
  const [tkpiPortionInput, setTkpiPortionInput] = useState('100');

  // Load cache data on mount
  useEffect(() => {
    async function loadCache() {
      try {
        const cache = await AsyncStorage.getItem('sppg_planner_cache');
        if (cache) {
          const parsed = JSON.parse(cache);
          if (parsed.usia) setUsia(parsed.usia);
          if (parsed.jmlSiswa) setJmlSiswa(parsed.jmlSiswa);
          if (parsed.spareMode) setSpareMode(parsed.spareMode);
          if (parsed.spareVal) setSpareVal(parsed.spareVal);
          if (parsed.budget) setBudget(parsed.budget);
          if (parsed.overhead !== undefined) setOverhead(Number(parsed.overhead));
          if (parsed.selected) {
            const migratedSelected = {};
            ['karbo', 'protein', 'sayur', 'buah'].forEach(kat => {
              const val = parsed.selected[kat];
              if (Array.isArray(val)) {
                migratedSelected[kat] = val;
              } else if (val) {
                migratedSelected[kat] = [val];
              } else {
                migratedSelected[kat] = [];
              }
            });
            setSelected(migratedSelected);
          }
          if (parsed.customMenus) setCustomMenus(parsed.customMenus);
          if (parsed.deletedMenuIds) setDeletedMenuIds(parsed.deletedMenuIds);
          if (parsed.menuPrices) setMenuPrices(parsed.menuPrices);
          if (parsed.categoriesList) setCategoriesList(parsed.categoriesList);
          if (parsed.customRecipeDetails) setCustomRecipeDetails(parsed.customRecipeDetails);
          
          if (parsed.recipeDetails) setRecipeDetails(parsed.recipeDetails);
          if (parsed.ingredientPrices) setIngredientPrices(parsed.ingredientPrices);
          
          if (parsed.qcRasa !== undefined) setQcRasa(parsed.qcRasa);
          if (parsed.qcAroma !== undefined) setQcAroma(parsed.qcAroma);
          if (parsed.qcTekstur !== undefined) setQcTekstur(parsed.qcTekstur);
          if (parsed.qcPenampilan !== undefined) setQcPenampilan(parsed.qcPenampilan);
          if (parsed.qcHigienitas !== undefined) setQcHigienitas(parsed.qcHigienitas);
          if (parsed.qcSuhu !== undefined) setQcSuhu(parsed.qcSuhu);
          if (parsed.qcWaktu !== undefined) setQcWaktu(parsed.qcWaktu);
          if (parsed.qcTesterName !== undefined) setQcTesterName(parsed.qcTesterName);
          if (parsed.qcNotes !== undefined) setQcNotes(parsed.qcNotes);
          if (parsed.qcStatus !== undefined) setQcStatus(parsed.qcStatus);
          
          // Load Gizsee Calculator cache
          if (parsed.calculatorRows) setCalculatorRows(parsed.calculatorRows);
          if (parsed.calculatorHistory) setCalculatorHistory(parsed.calculatorHistory);
          if (parsed.calcTargetUsia) setCalcTargetUsia(parsed.calcTargetUsia);
        }
      } catch (e) {
        console.warn('Gagal membaca cache lokal:', e);
      }
    }
    loadCache();
  }, []);

  // Auto save cache whenever state changes
  useEffect(() => {
    async function saveCache() {
      try {
        const cacheObj = {
          usia, jmlSiswa, spareMode, spareVal, budget, overhead, selected, customMenus, deletedMenuIds, menuPrices, customRecipeDetails,
          recipeDetails, ingredientPrices, categoriesList,
          qcRasa, qcAroma, qcTekstur, qcPenampilan, qcHigienitas, qcSuhu, qcWaktu, qcTesterName, qcNotes, qcStatus,
          calculatorRows, calculatorHistory, calcTargetUsia
        };
        await AsyncStorage.setItem('sppg_planner_cache', JSON.stringify(cacheObj));
      } catch (e) {
        console.warn('Gagal menyimpan cache:', e);
      }
    }
    saveCache();
  }, [usia, jmlSiswa, spareMode, spareVal, budget, overhead, selected, customMenus, deletedMenuIds, menuPrices, customRecipeDetails,
      recipeDetails, ingredientPrices, categoriesList,
      qcRasa, qcAroma, qcTekstur, qcPenampilan, qcHigienitas, qcSuhu, qcWaktu, qcTesterName, qcNotes, qcStatus,
      calculatorRows, calculatorHistory, calcTargetUsia]);

  // ═══════════════════════════════════════
  //  MATHEMATICAL CALCULATIONS
  // ═══════════════════════════════════════
  const siswaNum = parseInt(jmlSiswa, 10) || 0;
  const spareValNum = parseFloat(spareVal) || 0;
  const budgetNum = parseFloat(budget) || 0;
  
  const spareNum = spareMode === 'fix' ? spareValNum : Math.round(siswaNum * spareValNum / 100);
  const totalPorsi = siswaNum + spareNum;
  const budgetBB = Math.round(budgetNum * (1 - overhead / 100));
  const totalAnggaran = totalPorsi * budgetNum;

  const getIngredientCost = (nama, qtyPerPorsi, unit) => {
    const info = ingredientPrices[nama] || DEFAULT_INGREDIENT_PRICES[nama];
    if (!info) return 0;
    
    return calculateIngredientCost(nama, qtyPerPorsi, unit, info.price, info.unit);
  };

  const getMenuCostPerPortion = (item) => {
    const recipe = recipeDetails[item.id] || customRecipeDetails[item.id];
    if (!recipe) {
      return menuPrices[item.id] !== undefined ? menuPrices[item.id] : item.harga;
    }
    
    let cost = 0;
    if (recipe.utama) {
      cost += getIngredientCost(recipe.utama.nama, recipe.utama.qty, recipe.utama.unit);
    }
    if (recipe.pelengkap) {
      recipe.pelengkap.forEach(ing => {
        cost += getIngredientCost(ing.nama, ing.qty, ing.unit);
      });
    }
    return Math.round(cost);
  };

  const getMenuPortion = (item) => {
    const recipe = recipeDetails[item.id] || customRecipeDetails[item.id];
    if (recipe && recipe.utama && recipe.utama.nama) {
      const origPorsi = item.porsi || '';
      const match = origPorsi.match(/^[\d.]+\s*(?:g|kg|butir|pcs|buah|potong)?\s*(.*)$/i);
      if (match && match[1] && match[1].trim() !== '') {
        let suffix = match[1].trim();
        const unit = recipe.utama.unit || 'g';
        if (suffix.toLowerCase().startsWith(unit.toLowerCase())) {
          suffix = suffix.substring(unit.length).trim();
        }
        const space = (unit === 'g' || unit === 'kg') ? '' : ' ';
        return `${recipe.utama.qty}${space}${unit} ${suffix}`;
      }
      return `${recipe.utama.qty}${recipe.utama.unit} ${recipe.utama.nama}`;
    }
    return item.porsi;
  };

  const getMenuGizi = (item) => {
    const recipe = recipeDetails[item.id] || customRecipeDetails[item.id];
    if (!recipe) {
      return {
        kalori: Math.round(parseFloat(item.kalori) || 0),
        protein: parseFloat(item.protein) || 0,
        karbo: parseFloat(item.karbo) || 0,
        lemak: parseFloat(item.lemak) || 0,
        serat: parseFloat(item.serat) || 0
      };
    }
    
    let total = { kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0 };
    if (recipe.utama && recipe.utama.nama) {
      const g = getIngredientGizi(recipe.utama.nama, recipe.utama.qty, recipe.utama.unit);
      total.kalori += g.kalori;
      total.protein += g.protein;
      total.karbo += g.karbo;
      total.lemak += g.lemak;
      total.serat += g.serat;
    }
    if (recipe.pelengkap) {
      recipe.pelengkap.forEach(ing => {
        if (ing.nama) {
          const g = getIngredientGizi(ing.nama, ing.qty, ing.unit);
          total.kalori += g.kalori;
          total.protein += g.protein;
          total.karbo += g.karbo;
          total.lemak += g.lemak;
          total.serat += g.serat;
        }
      });
    }
    
    return {
      kalori: Math.round(total.kalori),
      protein: parseFloat(total.protein.toFixed(1)),
      karbo: parseFloat(total.karbo.toFixed(1)),
      lemak: parseFloat(total.lemak.toFixed(1)),
      serat: parseFloat(total.serat.toFixed(1))
    };
  };

  // Helper to map food icon name/string/emoji into rendering icon
  const getFoodIcon = (icon) => {
    if (!icon) return '🍽️';
    // If it's already an emoji (not alphanumeric and short length), return it
    if (icon.trim().length <= 2) return icon.trim();
    
    const iconMap = {
      'rice': '🍚',
      'bowl-rice': '🍙',
      'corn': '🌽',
      'potato': '🥔',
      'food-potato': '🥔',
      'ellipse': '🟡',
      'food-chicken': '🍗',
      'poultry-leg': '🍖',
      'egg-fried': '🍳',
      'square': '🟫',
      'square-outline': '🟨',
      'fish': '🐟',
      'food-steak': '🥩',
      'egg': '🥚',
      'carrot': '🥕',
      'leaf': '🥬',
      'silverware-clean': '🥦',
      'pot-steam': '🍲',
      'sprout': '🌿',
      'shaker-outline': '🫑',
      'food-apple': '🍎',
      'fruit-citrus': '🍊',
      'fruit-watermelon': '🍉',
      'fruit-pear': '🥭',
      'fruit-grapes': '🍈',
      'food-variant': '🌾',
      'seed': '🌾',
      'cow': '🥛',
      'glass-water': '🥛',
      'cheese': '🧀',
      'bread': '🍞',
      'noodles': '🍝',
      'chili': '🌶️'
    };
    return iconMap[icon.trim()] || '🍽️';
  };

  // Selected items calculation
  const getSelectedItems = () => {
    const list = [];
    categoriesList.forEach(kat => {
      const val = selected[kat];
      if (!val) return;
      const idsArray = Array.isArray(val) ? val : [val];
      
      const baseList = INITIAL_MENU_DATA[kat] || [];
      const combined = [...baseList, ...customMenus.filter(x => x.kat === kat)];
      
      idsArray.forEach(id => {
        if (deletedMenuIds.includes(id)) return;
        const found = combined.find(x => x.id === id);
        if (found) {
          const price = getMenuCostPerPortion(found);
          const gizi = getMenuGizi(found);
          list.push({ 
            ...found, 
            harga: price, 
            porsi: getMenuPortion(found),
            kalori: gizi.kalori,
            protein: gizi.protein,
            karbo: gizi.karbo,
            lemak: gizi.lemak,
            serat: gizi.serat,
            kat 
          });
        }
      });
    });
    return list;
  };

  const selectedItems = getSelectedItems();
  
  let totKal = 0, totProt = 0, totKar = 0, totLem = 0, totSerat = 0, totBiaya = 0;
  let hasCooked = false;
  selectedItems.forEach(it => {
    totKal += parseFloat(it.kalori) || 0;
    totProt += parseFloat(it.protein) || 0;
    totKar += parseFloat(it.karbo) || 0;
    totLem += parseFloat(it.lemak) || 0;
    totSerat += parseFloat(it.serat) || 0;
    totBiaya += parseFloat(it.harga) || 0;
    if (it.kat !== 'buah') {
      hasCooked = true;
    }
  });

  const bumbuCost = hasCooked ? 500 : 0;
  totBiaya += bumbuCost;

  const totalBB = totBiaya * totalPorsi;

  const activeAkg = AKG_DATA[usia] || AKG_DATA['sd_besar'];
  const diffBB = budgetBB - totBiaya;
  const isBudgetOk = diffBB >= 0;

  // Macro Calorie contribution percentage
  const calKarbo = totKar * 4;
  const calProt = totProt * 4;
  const calLemak = totLem * 9;
  const totalMacroCal = calKarbo + calProt + calLemak || 1;
  const pctKar = (calKarbo / totalMacroCal * 100);
  const pctProt = (calProt / totalMacroCal * 100);
  const pctLemak = (calLemak / totalMacroCal * 100);

  // ═══════════════════════════════════════
  //  UI INTERACTION ACTIONS
  // ═══════════════════════════════════════
  const toggleSelectMenu = (kat, id) => {
    setSelected(prev => {
      const currentList = Array.isArray(prev[kat]) ? prev[kat] : (prev[kat] ? [prev[kat]] : []);
      const newList = currentList.includes(id) 
        ? currentList.filter(x => x !== id) 
        : [...currentList, id];
      return {
        ...prev,
        [kat]: newList
      };
    });
  };

  const handleDeleteMenu = (item) => {
    setDeleteConfirmItem(item);
  };

  const updateMenuPrice = (id, priceStr) => {
    const val = parseFloat(priceStr) || 0;
    setMenuPrices(prev => ({ ...prev, [id]: val }));
  };

  const handleAddCustom = () => {
    if (!customNama) {
      Alert.alert('Form Kosong', 'Harap isi nama menu terlebih dahulu!');
      return;
    }
    const id = 'custom-' + Date.now();
    const emojiMap = {
      karbo: '🌾',
      protein: '🍗',
      sayur: '🥬',
      buah: '🍎'
    };
    const newItem = {
      id,
      icon: emojiMap[customKat] || '🍽️',
      nama: customNama,
      porsi: '1 Porsi',
      kalori: parseFloat(customKalori) || 0,
      protein: parseFloat(customProtein) || 0,
      karbo: parseFloat(customKarbo) || 0,
      lemak: parseFloat(customLemak) || 0,
      serat: parseFloat(customSerat) || 0,
      harga: parseFloat(customHarga) || 0,
      kat: customKat,
      mbgStatus: customMbgStatus || 'aman',
      mbgNotes: customMbgNotes || 'Bahan pangan lokal kustom.'
    };
    
    const activeIngs = customIngredients.filter(ing => ing.nama.trim() !== '');
    if (activeIngs.length > 0) {
      const mainIng = activeIngs[0];
      const recipe = {
        utama: {
          nama: mainIng.nama,
          qty: parseFloat(mainIng.qty) || 0,
          unit: mainIng.unit || 'g',
          catatan: mainIng.catatan || '—'
        }
      };
      if (activeIngs.length > 1) {
        recipe.pelengkap = activeIngs.slice(1).map(ing => ({
          nama: ing.nama,
          qty: parseFloat(ing.qty) || 0,
          unit: ing.unit || 'g',
          catatan: ing.catatan || ''
        }));
        recipe.pelengkapType = newItem.nama.toUpperCase().includes('KATSU') ? 'KATSU / GORENG' : 'PELENGKAP';
      }
      setCustomRecipeDetails(prev => ({
        ...prev,
        [id]: recipe
      }));
    }

    setCustomMenus(prev => [...prev, newItem]);
    setMenuPrices(prev => ({ ...prev, [id]: newItem.harga }));
    
    // Clear inputs
    setCustomIcon('');
    setCustomNama('');
    setCustomKalori('');
    setCustomProtein('');
    setCustomKarbo('');
    setCustomLemak('');
    setCustomSerat('');
    setCustomHarga('');
    setCustomMbgStatus('aman');
    setCustomMbgNotes('');
    setCustomIngredients([{ nama: '', qty: '', unit: 'g', catatan: '' }]);
    
    Alert.alert('Berhasil', `Menu ${customNama} telah ditambahkan ke kategori ${customKat}!`);
  };

  const getRecipeBreakdown = (selectedItems, totalPorsi, menuPrices) => {
    const categories = {
      karbo: { title: 'KARBOHIDRAT', items: [] },
      protein: { title: 'PROTEIN', items: [] },
      minyak: { title: 'MINYAK & BUMBU', items: [] },
      sayur: { title: 'SAYURAN', items: [] },
      buah: { title: 'BUAH', items: [] }
    };

    let hasCooked = false;

    selectedItems.forEach(item => {
      const catKey = item.kat; // 'karbo', 'protein', 'sayur', 'buah'
      if (catKey !== 'buah') hasCooked = true;

      const baseBreakdown = RECIPE_BREAKDOWNS[item.id] || [
        { nama: item.nama, qty: 1, unit: item.porsi.toLowerCase().includes('buah') ? 'buah' : item.porsi.toLowerCase().includes('potong') ? 'potong' : 'porsi', harga: item.harga, isMain: true }
      ];

      const itemPrice = menuPrices[item.id] !== undefined ? menuPrices[item.id] : item.harga;

      const mapped = baseBreakdown.map(sub => {
        let displayPrice = sub.harga;
        if (sub.isMain) {
          displayPrice = itemPrice;
        }
        return {
          nama: sub.nama,
          qtyPerPorsi: sub.qty,
          unit: sub.unit,
          harga: displayPrice
        };
      });

      if (categories[catKey]) {
        categories[catKey].items.push({
          menuName: item.nama,
          ingredients: mapped
        });
      }
    });

    if (hasCooked) {
      categories.minyak.items.push({
        menuName: 'Minyak & Bumbu',
        ingredients: [
          { nama: 'Minyak goreng', qtyPerPorsi: 10, unit: 'ml', harga: 200 },
          { nama: 'Bawang merah', qtyPerPorsi: 5, unit: 'g', harga: 0 },
          { nama: 'Bawang putih', qtyPerPorsi: 3, unit: 'g', harga: 0 },
          { nama: 'Garam', qtyPerPorsi: 2, unit: 'g', harga: 0 }
        ]
      });
    }

    return categories;
  };

  const formatSubQty = (qtyPerPorsi, unit, totalPorsiVal) => {
    const totalVal = qtyPerPorsi * totalPorsiVal;
    if (unit === 'g' || unit === 'g fillet') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(1).replace('.', ',')} kg`;
      return `${Math.round(totalVal)} g`;
    }
    if (unit === 'ml') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(1).replace('.', ',')} liter`;
      return `${Math.round(totalVal)} ml`;
    }
    return `${Math.ceil(totalVal)} ${unit}`;
  };

  const getProteinCardInfo = (selectedProtein, totalPorsiVal) => {
    if (!selectedProtein) return { title: 'Kebutuhan Protein', val: '0', sub: 'Pilih protein' };
    
    const details = recipeDetails[selectedProtein.id] || customRecipeDetails[selectedProtein.id];
    if (details && details.utama) {
      const u = details.utama;
      const totalWeight = u.qty * totalPorsiVal;
      let displayVal = '';
      if (u.unit === 'g') {
        displayVal = totalWeight >= 1000 ? `${(totalWeight/1000).toFixed(1).replace('.', ',')} kg` : `${Math.round(totalWeight)} g`;
      } else {
        displayVal = `${Math.ceil(totalWeight)} ${u.unit}`;
      }
      return {
        title: `Kebutuhan ${u.nama.split(' ')[0]}`,
        val: displayVal,
        sub: `${u.qty} ${u.unit} / orang (mentah)`
      };
    }
    
    return {
      title: 'Kebutuhan Protein',
      val: `${totalPorsiVal} porsi`,
      sub: selectedProtein.porsi
    };
  };

  const renderPelengkapCards = (selectedProtein, totalPorsiVal) => {
    if (!selectedProtein) return null;
    const details = recipeDetails[selectedProtein.id] || customRecipeDetails[selectedProtein.id];
    if (!details || !details.pelengkap) return null;
    
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionSubTitle}>BAHAN PELENGKAP {details.pelengkapType || 'UTAMA'}</Text>
        <View style={styles.pelengkapGrid}>
          {details.pelengkap.map((p, idx) => {
            const totalVal = p.qty * totalPorsiVal;
            let displayVal = '';
            if (p.unit === 'g') {
              displayVal = totalVal >= 1000 ? `${(totalVal/1000).toFixed(1).replace('.', ',')} kg` : `${Math.round(totalVal)} g`;
            } else if (p.unit === 'ml') {
              displayVal = totalVal >= 1000 ? `${(totalVal/1000).toFixed(1).replace('.', ',')} liter` : `${Math.round(totalVal)} ml`;
            } else {
              displayVal = `${Math.ceil(totalVal)} ${p.unit}`;
            }
            
            return (
              <View key={idx} style={styles.pelengkapCard}>
                <Text style={styles.pelengkapLabel}>{p.nama}</Text>
                <Text style={styles.pelengkapValue}>{displayVal}</Text>
                <Text style={styles.pelengkapSub}>{p.qty} {p.unit}/orang</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getConsolidatedIngredients = (selectedItems, totalPorsiVal) => {
    const list = [];
    let hasCooked = false;

    selectedItems.forEach(item => {
      if (item.kat !== 'buah') hasCooked = true;
      const details = recipeDetails[item.id] || customRecipeDetails[item.id];
      
      if (details && details.utama) {
        const u = details.utama;
        list.push({
          nama: u.nama,
          qtyPerPorsi: u.qty,
          unit: u.unit,
          catatan: u.catatan,
          isUtama: item.kat === 'protein'
        });
        
        // Also push pelengkap ingredients of this menu item to the consolidated list!
        if (details.pelengkap) {
          details.pelengkap.forEach(p => {
            list.push({
              nama: p.nama,
              qtyPerPorsi: p.qty,
              unit: p.unit,
              catatan: p.catatan || 'Pelengkap menu',
              isUtama: false
            });
          });
        }
      } else {
        list.push({
          nama: item.nama,
          qtyPerPorsi: 1,
          unit: item.porsi.toLowerCase().includes('buah') ? 'buah' : 'porsi',
          catatan: item.mbgNotes || '—',
          isUtama: item.kat === 'protein'
        });
      }
    });

    if (hasCooked) {
      list.push({ nama: 'Minyak goreng', qtyPerPorsi: 15, unit: 'ml', catatan: 'Tumis + finishing' });
      list.push({ nama: 'Garam', qtyPerPorsi: 2, unit: 'g', catatan: '—' });
      list.push({ nama: 'Gula pasir', qtyPerPorsi: 3, unit: 'g', catatan: '—' });
      list.push({ nama: 'Bawang merah', qtyPerPorsi: 8, unit: 'g', catatan: 'Bumbu dasar' });
      list.push({ nama: 'Bawang putih', qtyPerPorsi: 5, unit: 'g', catatan: 'Bumbu dasar' });
    }

    // Now merge duplicate ingredients together (consolidate by name)!
    const consolidatedMap = {};
    list.forEach(ing => {
      const name = ing.nama;
      if (consolidatedMap[name]) {
        // If unit matches, sum up. Otherwise add as separate or keep unit
        consolidatedMap[name].qtyPerPorsi += ing.qtyPerPorsi;
        if (ing.isUtama) consolidatedMap[name].isUtama = true;
      } else {
        consolidatedMap[name] = { ...ing };
      }
    });

    return Object.values(consolidatedMap);
  };

  const formatGrossTotal = (qtyPerPorsi, bdd, unit, totalPorsiVal) => {
    const totalVal = (qtyPerPorsi / bdd) * totalPorsiVal;
    if (unit === 'g') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(2).replace('.', ',')}`;
      return `${Math.round(totalVal)}`;
    }
    if (unit === 'ml') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(2).replace('.', ',')}`;
      return `${Math.round(totalVal)}`;
    }
    return `${Math.ceil(totalVal)}`;
  };

  const getGrossSatuan = (qtyPerPorsi, bdd, unit, totalPorsiVal) => {
    const totalVal = (qtyPerPorsi / bdd) * totalPorsiVal;
    if (unit === 'g') {
      return totalVal >= 1000 ? 'kg' : 'g';
    }
    if (unit === 'ml') {
      return totalVal >= 1000 ? 'liter' : 'ml';
    }
    return unit;
  };

  const formatIngredientTotal = (qtyPerPorsi, unit, totalPorsiVal) => {
    const totalVal = qtyPerPorsi * totalPorsiVal;
    if (unit === 'g') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(1).replace('.', ',')}`;
      return `${Math.round(totalVal)}`;
    }
    if (unit === 'ml') {
      if (totalVal >= 1000) return `${(totalVal / 1000).toFixed(1).replace('.', ',')}`;
      return `${Math.round(totalVal)}`;
    }
    return `${Math.ceil(totalVal)}`;
  };

  const getIngredientSatuan = (qtyPerPorsi, unit, totalPorsiVal) => {
    const totalVal = qtyPerPorsi * totalPorsiVal;
    if (unit === 'g') {
      return totalVal >= 1000 ? 'kg' : 'g';
    }
    if (unit === 'ml') {
      return totalVal >= 1000 ? 'liter' : 'ml';
    }
    return unit;
  };

  const formatBahanTotal = (item, totalPorsiVal) => {
    const porsi = item.porsi.toLowerCase();
    const numMatch = porsi.match(/(\d+[\.,]?\d*)/);
    if (!numMatch) return `${totalPorsiVal} porsi`;
    const val = parseFloat(numMatch[1].replace(',', '.'));
    if (porsi.includes('butir')) return `${Math.ceil(val * totalPorsiVal)} butir`;
    if (porsi.includes('buah')) return `${Math.ceil(val * totalPorsiVal)} buah`;
    if (porsi.includes('g ')) {
      const totalGram = val * totalPorsiVal;
      if (totalGram >= 1000) return `${(totalGram / 1000).toFixed(2)} kg`;
      return `${Math.round(totalGram)} g`;
    }
    return `${Math.ceil(val * totalPorsiVal)} porsi`;
  };

  // ═══════════════════════════════════════
  //  EXPORT PDF & SHARE CSV
  // ═══════════════════════════════════════
  const generatePDFReport = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Perhatian', 'Pilih minimal satu menu untuk dicetak!');
      return;
    }

    const akgRowsHtml = Object.keys(AKG_DATA).map(key => {
      const g = AKG_DATA[key];
      const calP = Math.round(totKal / g.kal * 100);
      const protP = Math.round(totProt / g.protein * 100);
      const activeStyle = key === usia ? 'background:#e8f5e9;font-weight:bold;' : '';
      return `
        <tr style="${activeStyle}">
          <td style="border:1px solid #333;padding:6px 8px;"><strong>${g.name}</strong><br><small>Waktu: ${g.waktu} | Rujukan: ${g.rujukan}</small></td>
          <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${totKal} / ${g.kal} kkal (${calP}%)</td>
          <td style="border:1px solid #333;padding:6px 8px;text-align:center;">${totProt.toFixed(1)} / ${g.protein.toFixed(1)}g (${protP}%)</td>
        </tr>
      `;
    }).join('');

    const consolidated = getConsolidatedIngredients(selectedItems, totalPorsi);
    let itemsHtml = '';
    let rowIdx = 1;
    consolidated.forEach(ing => {
      const qtyStr = `${ing.qtyPerPorsi} ${ing.unit}`;
      const totStr = `${formatIngredientTotal(ing.qtyPerPorsi, ing.unit, totalPorsi)} ${getIngredientSatuan(ing.qtyPerPorsi, ing.unit, totalPorsi)}`;
      const boldStyle = ing.isUtama ? 'font-weight:bold;' : '';
      const badge = ing.isUtama ? ' <span style="font-size:7px;background:#1e3a8a;color:#93c5fd;padding:1px 4px;border-radius:2px;text-transform:uppercase;font-weight:800;">UTAMA</span>' : '';
      itemsHtml += `
        <tr>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;">${rowIdx}</td>
          <td style="border:1px solid #333;padding:5px 8px;${boldStyle}">${ing.nama}${badge}</td>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;">${qtyStr}</td>
          <td style="border:1px solid #333;padding:5px 8px;text-align:center;font-weight:bold;">${totStr}</td>
          <td style="border:1px solid #333;padding:5px 8px;font-size:10px;color:#555;">${ing.catatan || '—'}</td>
        </tr>
      `;
      rowIdx++;
    });

    const htmlContent = generateSPPGHtml({
      totalPorsi, siswaNum, spareNum, budgetNum, overhead,
      totBiaya, budgetBB, isBudgetOk, totalAnggaran,
      totKal, totProt, totKar, totLem, totSerat,
      activeAkg, usia,
      selectedItems, itemsHtml, akgRowsHtml,
      qcRasa, qcAroma, qcTekstur, qcPenampilan,
      qcHigienitas, qcSuhu, qcWaktu,
      qcTesterName, qcNotes, qcStatus,
      consolidatedIngredients: consolidated,
      jamMakanSiang
    });

    if (Platform.OS === 'web') {
      try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '800px';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        iframe.contentWindow.focus();
        setTimeout(() => {
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        }, 500);
      } catch (e) {
        console.error(e);
        alert('Terjadi kesalahan saat mencetak laporan di web.');
      }
    } else {
      try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Formulir QC SPPG-MBG (PDF)' });
      } catch (e) {
        Alert.alert('Gagal', 'Terjadi kesalahan saat memproses file cetak PDF.');
      }
    }
  };

  const handleExportCSV = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Perhatian', 'Pilih kombinasi menu terlebih dahulu!');
      return;
    }

    const rows = [
      ['LAPORAN KEBUTUHAN BAHAN BAKU MBG (SPPG)'],
      ['Kelompok Usia Target Utama', activeAkg.name],
      ['Total Porsi Produksi', totalPorsi],
      ['Budget/Porsi', budgetNum],
      ['Overhead Operasional', `${overhead}%`],
      [],
      ['Bahan Baku', 'Takaran Per Porsi', 'Total Kebutuhan', 'Catatan']
    ];

    const consolidated = getConsolidatedIngredients(selectedItems, totalPorsi);
    consolidated.forEach(ing => {
      rows.push([
        ing.nama,
        `${ing.qtyPerPorsi} ${ing.unit}`,
        `${formatIngredientTotal(ing.qtyPerPorsi, ing.unit, totalPorsi)} ${getIngredientSatuan(ing.qtyPerPorsi, ing.unit, totalPorsi)}`,
        ing.catatan
      ]);
    });

    rows.push([]);
    rows.push(['Total Biaya Bahan Baku per Porsi', `Rp ${totBiaya.toLocaleString('id')}`]);
    rows.push([`Overhead Operasional (${overhead}%)`, `Rp ${(Math.round(budgetNum * overhead / 100)).toLocaleString('id')}`]);
    rows.push(['Total Biaya per Porsi Aktual', `Rp ${(totBiaya + Math.round(budgetNum * overhead / 100)).toLocaleString('id')}`]);

    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const fileUri = FileSystem.cacheDirectory + `rencana-menu-mbg-${usia}.csv`;
    
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Bagikan file CSV' });
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat file CSV: ' + e.message);
    }
  };

  // ═══════════════════════════════════════
  //  TAB RENDER PAGES
  // ═══════════════════════════════════════
  const renderTab1 = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>👤 Penerima Manfaat</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Jumlah Siswa Utama</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={jmlSiswa}
          onChangeText={setJmlSiswa}
          placeholder="Masukkan jumlah siswa"
          placeholderTextColor="#626C90"
        />
        
        <Text style={styles.label}>Kelompok Usia Target</Text>
        <View style={styles.pickerWrapper}>
          {Object.keys(AKG_DATA).map(key => (
            <TouchableOpacity
              key={key}
              style={[styles.pickerBtn, usia === key && styles.pickerBtnActive]}
              onPress={() => {
                setUsia(key);
                if (AKG_DATA[key].waktu === 'Makan Pagi') {
                  setJamMakanSiang('07:30');
                } else {
                  setJamMakanSiang('11:30');
                }
              }}
            >
              <Text style={[styles.pickerBtnText, usia === key && styles.pickerBtnTextActive]}>
                {AKG_DATA[key].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          Target {activeAkg.waktu}: {activeAkg.kal} kkal, P: {activeAkg.protein.toFixed(1)}g, K: {activeAkg.karbo.toFixed(1)}g, L: {activeAkg.lemak.toFixed(1)}g
        </Text>
      </View>

      <Text style={styles.sectionTitle}>👥 Porsi Cadangan / Relawan</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Metode Perhitungan</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, spareMode === 'fix' && styles.toggleBtnActive]}
            onPress={() => setSpareMode('fix')}
          >
            <Text style={[styles.toggleBtnText, spareMode === 'fix' && styles.toggleBtnTextActive]}>Porsi Tetap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, spareMode === 'pct' && styles.toggleBtnActive]}
            onPress={() => setSpareMode('pct')}
          >
            <Text style={[styles.toggleBtnText, spareMode === 'pct' && styles.toggleBtnTextActive]}>Persentase (%)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>{spareMode === 'fix' ? 'Jumlah Cadangan (Porsi)' : 'Persentase Cadangan (%)'}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={spareVal}
          onChangeText={setSpareVal}
          placeholder="0"
          placeholderTextColor="#626C90"
        />
        <Text style={styles.hint}>
          Dihitung: +{spareNum} porsi ekstra. Total produksi menjadi {totalPorsi} porsi.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>💰 Anggaran &amp; Overhead</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Budget per Porsi (Rp)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
          placeholder="10000"
          placeholderTextColor="#626C90"
        />
        <Text style={styles.hint}>Rata-rata standar Makanan Bergizi Gratis Rp 10.000 - Rp 15.000.</Text>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Overhead Operasional</Text>
          <Text style={styles.orangeText}>{overhead}%</Text>
        </View>
        <View style={styles.sliderContainer}>
          <TouchableOpacity 
            style={styles.sliderButton} 
            onPress={() => setOverhead(prev => Math.max(0, prev - 5))}
          >
            <Text style={styles.sliderButtonText}>-5%</Text>
          </TouchableOpacity>
          <View style={styles.sliderMockTrack}>
            <View style={[styles.sliderMockFill, { width: `${overhead * 2}%` }]} />
          </View>
          <TouchableOpacity 
            style={styles.sliderButton} 
            onPress={() => setOverhead(prev => Math.min(50, prev + 5))}
          >
            <Text style={styles.sliderButtonText}>+5%</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Peralatan memasak, wadah mika/kemasan, biaya gas LPG, bumbu halus, dan kurir.</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <Text style={styles.cellLabel}>Total Porsi</Text>
          <Text style={[styles.cellValue, styles.blueText]}>{totalPorsi}</Text>
          <Text style={styles.cellSub}>{siswaNum} sis + {spareNum} extra</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.cellLabel}>Bahan Baku/Pors</Text>
          <Text style={[styles.cellValue, styles.orangeText]}>Rp {budgetBB.toLocaleString('id')}</Text>
          <Text style={styles.cellSub}>Overhead {overhead}%</Text>
        </View>
        <View style={styles.summaryCell}>
          <Text style={styles.cellLabel}>Anggaran</Text>
          <Text style={[styles.cellValue, styles.greenText]}>
            {totalAnggaran >= 1000000 ? `${(totalAnggaran/1000000).toFixed(1)} Jt` : `Rp ${totalAnggaran.toLocaleString('id')}`}
          </Text>
          <Text style={styles.cellSub}>Maksimal Belanja</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab(2)}>
        <Text style={styles.primaryButtonText}>Lanjut Pilih Menu</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#000" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTab2 = () => {
    const categories = categoriesList.map(katKey => {
      if (katKey === 'karbo') return { key: 'karbo', title: '🌾 Karbohidrat Utama' };
      if (katKey === 'protein') return { key: 'protein', title: '🍗 Protein Hewani / Nabati' };
      if (katKey === 'sayur') return { key: 'sayur', title: '🥬 Sayuran Hijau' };
      if (katKey === 'buah') return { key: 'buah', title: '🍎 Buah Pencuci Mulut' };
      const displayTitle = katKey.charAt(0).toUpperCase() + katKey.slice(1);
      return { key: katKey, title: `🍽️ ${displayTitle}` };
    });

    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.infoAlert}>
          <MaterialCommunityIcons name="information" size={16} color="#60A5FA" />
          <Text style={styles.infoText}>Pilih tepat 1 bahan makanan dari tiap kategori gizi.</Text>
        </View>

        {categories.map(cat => {
          const list = (INITIAL_MENU_DATA[cat.key] || []).filter(x => !deletedMenuIds.includes(x.id));
          const custom = customMenus.filter(x => x.kat === cat.key && !deletedMenuIds.includes(x.id));
          const combined = [...list, ...custom];

          return (
            <View key={cat.key}>
              <Text style={styles.menuHeader}>{cat.title}</Text>
              <View style={styles.menuGrid}>
                {combined.map(item => {
                  const isSel = Array.isArray(selected[cat.key]) ? selected[cat.key].includes(item.id) : selected[cat.key] === item.id;
                  const priceVal = getMenuCostPerPortion(item);
                  
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.menuItem, isSel && styles.menuItemActive]}
                      onPress={() => toggleSelectMenu(cat.key, item.id)}
                    >
                      {isSel && (
                        <View style={styles.checkMarkCircle}>
                          <MaterialCommunityIcons name="check" size={12} color="#07090e" />
                        </View>
                      )}
                      <Text style={styles.itemEmoji}>
                        {getFoodIcon(item.icon)}
                      </Text>
                      <Text style={styles.itemName} numberOfLines={1}>{item.nama}</Text>
                      <Text style={styles.itemPortion} numberOfLines={1}>{getMenuPortion(item)}</Text>
                      
                      {/* MBG Compliance Badge */}
                      {item.mbgStatus && (
                        <View style={[
                          styles.complianceBadge,
                          item.mbgStatus === 'aman' ? styles.badgeAman :
                          item.mbgStatus === 'dibatasi' ? styles.badgeDibatasi : styles.badgeDilarang
                        ]}>
                          <Text style={[
                            styles.complianceBadgeText,
                            item.mbgStatus === 'aman' ? styles.textAman :
                            item.mbgStatus === 'dibatasi' ? styles.textDibatasi : styles.textDilarang
                          ]}>
                            {item.mbgStatus === 'aman' ? 'AM-Lokal' :
                             item.mbgStatus === 'dibatasi' ? 'Dibatasi' : 'Dilarang'}
                          </Text>
                        </View>
                      )}

                      {(() => {
                        const g = getMenuGizi(item);
                        return <Text style={styles.itemGizi}>{g.kalori} kkal · P:{g.protein}g</Text>;
                      })()}
                      
                      {getRecipeIngredientsListStr(item.id) !== '' && (
                        <Text style={styles.itemIngredientsText} numberOfLines={1}>
                          📦 {getRecipeIngredientsListStr(item.id)}
                        </Text>
                      )}

                      <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: '#4ADE80', fontWeight: '800' }]}>
                          Rp {priceVal.toLocaleString('id')}
                        </Text>
                        <Text style={styles.priceLabel}>/p</Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 }}>
                        <TouchableOpacity 
                          style={[styles.editRecipeBtn, { flex: 1, marginTop: 0 }]}
                          onPress={() => openRecipeEditorModal(item, cat.key)}
                        >
                          <MaterialCommunityIcons name="pencil-box" size={12} color="#60A5FA" />
                          <Text style={styles.editRecipeBtnText}>Resep &amp; Harga</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{
                            padding: 6,
                            backgroundColor: 'rgba(248, 113, 113, 0.08)',
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: 'rgba(248, 113, 113, 0.2)',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onPress={() => handleDeleteMenu({ ...item, kat: cat.key })}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={12} color="#F87171" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Form Tambah Custom */}
        <Text style={styles.sectionTitle}>➕ Tambah Bahan Custom Lokal</Text>
        
        {/* Tombol Kamus Gizi TKPI & Regulasi */}
        <TouchableOpacity 
          style={styles.searchTkpiBtn} 
          onPress={() => {
            setTkpiModalMode('custom_menu');
            setTkpiSearchQuery('');
            setSelectedTkpiItem(null);
            setTkpiPortionInput('100');
            setShowTkpiModal(true);
          }}
        >
          <MaterialCommunityIcons name="magnify" size={18} color="#4ADE80" />
          <Text style={styles.searchTkpiBtnText}>🔍 Cari Kamus Gizi TKPI & Kepatuhan MBG</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.label}>Kategori &amp; Nama Pangan</Text>
          <View style={[styles.row, { alignItems: 'center', marginBottom: 8 }]}>
            {/* Category selector dropdown triggers on the left (replacing customIcon) */}
            <View style={{ flex: 1.2, marginRight: 8 }}>
              <TouchableOpacity 
                style={[styles.dropdownHeader, { marginBottom: 0, paddingVertical: 10, paddingHorizontal: 8 }]} 
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={[styles.dropdownHeaderText, { fontSize: 12.5 }]} numberOfLines={1}>
                  {customKat ? customKat.toUpperCase() : 'KATEGORI'}
                </Text>
                <MaterialCommunityIcons 
                  name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#60A5FA" 
                />
              </TouchableOpacity>
            </View>

            {/* Nama Menu / Makanan text input on the right */}
            <View style={{ flex: 2 }}>
              <TextInput
                style={[styles.input, { fontSize: 14, marginBottom: 0, paddingVertical: 8 }]}
                value={customNama}
                onChangeText={setCustomNama}
                placeholder="Nama Menu / Makanan"
                placeholderTextColor="#626C90"
              />
            </View>
          </View>

          {/* Category Dropdown List overlay */}
          {showCategoryDropdown && (
            <View style={[styles.dropdownListContainer, { marginTop: -4 }]}>
              {categoriesList.map(k => (
                <TouchableOpacity
                  key={k}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCustomKat(k);
                    setIsAddingNewCategory(false);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, customKat === k && { color: '#60A5FA', fontWeight: 'bold' }]}>
                    {k.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', flexDirection: 'row', alignItems: 'center', paddingTop: 8, marginTop: 4 }]}
                onPress={() => {
                  setIsAddingNewCategory(true);
                  setShowCategoryDropdown(false);
                }}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#4ADE80" />
                <Text style={[styles.dropdownItemText, { color: '#4ADE80', marginLeft: 4 }]}>
                  TAMBAH KATEGORI BARU...
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Custom Category Input Panel */}
          {isAddingNewCategory && (
            <View style={{ marginTop: 4, marginBottom: 12, padding: 12, backgroundColor: 'rgba(15, 18, 28, 0.6)', borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8 }}>
              <Text style={[styles.label, { marginTop: 0, marginBottom: 6 }]}>Nama Kategori Baru</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 2, marginRight: 8, fontSize: 13, marginBottom: 0 }]}
                  value={newCategoryInput}
                  onChangeText={setNewCategoryInput}
                  placeholder="Contoh: nabati, cemilan, dll"
                  placeholderTextColor="#626C90"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#4ADE80' }]}
                  onPress={() => {
                    const cleanKat = newCategoryInput.trim().toLowerCase();
                    if (!cleanKat) {
                      Alert.alert('Perhatian', 'Nama kategori tidak boleh kosong!');
                      return;
                    }
                    if (categoriesList.includes(cleanKat)) {
                      Alert.alert('Perhatian', 'Kategori sudah terdaftar!');
                      setCustomKat(cleanKat);
                      setIsAddingNewCategory(false);
                      setNewCategoryInput('');
                      return;
                    }
                    setCategoriesList(prev => [...prev, cleanKat]);
                    setCustomKat(cleanKat);
                    setIsAddingNewCategory(false);
                    setNewCategoryInput('');
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 12 }}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={styles.label}>Nutrisi Makro &amp; Harga</Text>
          <View style={styles.grid3}>
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customKalori}
              onChangeText={setCustomKalori}
              placeholder="Kalori (kkal)"
              placeholderTextColor="#626C90"
            />
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customProtein}
              onChangeText={setCustomProtein}
              placeholder="Protein (g)"
              placeholderTextColor="#626C90"
            />
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customKarbo}
              onChangeText={setCustomKarbo}
              placeholder="Karbohidrat (g)"
              placeholderTextColor="#626C90"
            />
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customLemak}
              onChangeText={setCustomLemak}
              placeholder="Lemak (g)"
              placeholderTextColor="#626C90"
            />
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customSerat}
              onChangeText={setCustomSerat}
              placeholder="Serat (g)"
              placeholderTextColor="#626C90"
            />
            <TextInput
              style={styles.gridInput}
              keyboardType="numeric"
              value={customHarga}
              onChangeText={setCustomHarga}
              placeholder="Harga (Rp)"
              placeholderTextColor="#626C90"
            />
          </View>

          {/* Custom Recipe Builder Section */}
          <Text style={[styles.label, { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }]}>
            📋 Rincian Bahan Baku Resep (Opsional)
          </Text>
          <Text style={{ color: '#626C90', fontSize: 10, marginBottom: 8, lineHeight: 14 }}>
            Baris pertama akan dianggap sebagai Bahan Utama. Baris selanjutnya adalah Bahan Pelengkap.
          </Text>
          
          {customIngredients.map((ing, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
              <TextInput
                style={[styles.input, { flex: 2, fontSize: 12, paddingVertical: 6, marginBottom: 0 }]}
                value={ing.nama}
                onChangeText={(val) => {
                  const newIngs = [...customIngredients];
                  newIngs[idx].nama = val;
                  setCustomIngredients(newIngs);
                }}
                placeholder={idx === 0 ? "Bahan Utama (misal: Ayam)" : "Bahan Pelengkap"}
                placeholderTextColor="#626C90"
              />
              <TextInput
                style={[styles.input, { flex: 1, fontSize: 12, paddingVertical: 6, marginBottom: 0, textAlign: 'center' }]}
                keyboardType="numeric"
                value={ing.qty}
                onChangeText={(val) => {
                  const newIngs = [...customIngredients];
                  newIngs[idx].qty = val;
                  setCustomIngredients(newIngs);
                }}
                placeholder="Qty"
                placeholderTextColor="#626C90"
              />
              <TextInput
                style={[styles.input, { flex: 0.8, fontSize: 12, paddingVertical: 6, marginBottom: 0, textAlign: 'center' }]}
                value={ing.unit}
                onChangeText={(val) => {
                  const newIngs = [...customIngredients];
                  newIngs[idx].unit = val;
                  setCustomIngredients(newIngs);
                }}
                placeholder="unit"
                placeholderTextColor="#626C90"
              />
              <TextInput
                style={[styles.input, { flex: 1.5, fontSize: 12, paddingVertical: 6, marginBottom: 0 }]}
                value={ing.catatan}
                onChangeText={(val) => {
                  const newIngs = [...customIngredients];
                  newIngs[idx].catatan = val;
                  setCustomIngredients(newIngs);
                }}
                placeholder="Catatan"
                placeholderTextColor="#626C90"
              />
              {customIngredients.length > 1 && (
                <TouchableOpacity
                  style={{ padding: 8, backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: 6, borderWidth: 1, borderColor: '#F87171' }}
                  onPress={() => {
                    setCustomIngredients(customIngredients.filter((_, i) => i !== idx));
                  }}
                >
                  <MaterialCommunityIcons name="delete-outline" size={14} color="#F87171" />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: 6,
              paddingVertical: 8,
              alignItems: 'center',
              marginBottom: 16
            }}
            onPress={() => setCustomIngredients([...customIngredients, { nama: '', qty: '', unit: 'g', catatan: '' }])}
          >
            <Text style={{ color: '#A5ACCC', fontSize: 11, fontWeight: '700' }}>
              + Tambah Baris Bahan Baku
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleAddCustom}>
            <Text style={styles.secondaryBtnText}>+ Tambahkan Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Live Preview Box */}
        {selectedItems.length > 0 && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>🔄 RINGKASAN SEMENTARA</Text>
            <View style={styles.previewGrid}>
              <View>
                <Text style={styles.pLabel}>Energi</Text>
                <Text style={[styles.pValue, styles.yellowText]}>{totKal} kkal</Text>
                <Text style={styles.pSub}>{Math.round(totKal/activeAkg.kal*100)}% AKG</Text>
              </View>
              <View>
                <Text style={styles.pLabel}>Protein</Text>
                <Text style={[styles.pValue, styles.greenText]}>{totProt.toFixed(1)}g</Text>
                <Text style={styles.pSub}>{Math.round(totProt/activeAkg.protein*100)}% AKG</Text>
              </View>
              <View>
                <Text style={styles.pLabel}>Belanja</Text>
                <Text style={[styles.pValue, styles.orangeText]}>Rp {totBiaya.toLocaleString('id')}</Text>
                <Text style={styles.pSub}>limit Rp {budgetBB.toLocaleString('id')}</Text>
              </View>
              <View>
                <Text style={styles.pLabel}>Status</Text>
                <Text style={[styles.pValue, isBudgetOk ? styles.greenText : styles.redText]}>
                  {isBudgetOk ? 'AMAN' : 'OVER'}
                </Text>
                <Text style={styles.pSub}>{isBudgetOk ? 'Sesuai Budget' : 'Melebihi Limit'}</Text>
              </View>
            </View>

            {/* Macro Bar */}
            <View style={styles.macroTrack}>
              <View style={[styles.macroBarSegment, { width: `${pctKar}%`, backgroundColor: '#60A5FA' }]} />
              <View style={[styles.macroBarSegment, { width: `${pctProt}%`, backgroundColor: '#4ADE80' }]} />
              <View style={[styles.macroBarSegment, { width: `${pctLemak}%`, backgroundColor: '#FB923C' }]} />
            </View>
            <View style={styles.macroLabelsRow}>
              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: '#60A5FA' }]} />
                <Text style={styles.dotLabel}>Karbo ({Math.round(pctKar)}%)</Text>
              </View>
              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
                <Text style={styles.dotLabel}>Protein ({Math.round(pctProt)}%)</Text>
              </View>
              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: '#FB923C' }]} />
                <Text style={styles.dotLabel}>Lemak ({Math.round(pctLemak)}%)</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.stepFooter}>
          <TouchableOpacity style={styles.ghostButton} onPress={() => setActiveTab(1)}>
            <Text style={styles.ghostButtonText}>Kembali</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab(3)}>
            <Text style={styles.primaryButtonText}>Lihat Analisis</Text>
            <MaterialCommunityIcons name="chart-line" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderTab3 = () => (
    <ScrollView style={styles.tabContent}>
      {/* Alert Budget */}
      <View style={[styles.alertContainer, isBudgetOk ? styles.alertContainerGreen : styles.alertContainerOrange]}>
        <MaterialCommunityIcons 
          name={isBudgetOk ? 'check-circle' : 'alert-circle'} 
          size={20} 
          color={isBudgetOk ? '#4ADE80' : '#FB923C'} 
        />
        <Text style={[styles.alertTextText, { color: isBudgetOk ? '#4ADE80' : '#FB923C' }]}>
          {isBudgetOk 
            ? `Menu masuk budget! Sisa dana Rp ${Math.round(diffBB).toLocaleString('id')}/porsi.`
            : `Over budget Rp ${Math.abs(Math.round(diffBB)).toLocaleString('id')}/porsi! Ganti protein/buah.`
          }
        </Text>
      </View>

      {/* Compliance Regulation Box */}
      {(() => {
        const dilarangItems = selectedItems.filter(it => it.mbgStatus === 'dilarang');
        const dibatasiItems = selectedItems.filter(it => it.mbgStatus === 'dibatasi');
        
        if (dilarangItems.length > 0) {
          return (
            <View style={[styles.complianceAlertBox, styles.complianceAlertRed]}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#F87171" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.complianceAlertTitleRed}>❌ PELANGGARAN REGULASI MBG</Text>
                <Text style={styles.complianceAlertDesc}>
                  Ditemukan bahan makanan dilarang (Ultra-Processed Food pabrikan) dalam menu terpilih:
                </Text>
                {dilarangItems.map(it => (
                  <Text key={it.id} style={styles.complianceAlertItem}>
                    • {it.nama} (Catatan: {it.mbgNotes || 'Dilarang oleh Badan Gizi Nasional'})
                  </Text>
                ))}
              </View>
            </View>
          );
        } else if (dibatasiItems.length > 0) {
          return (
            <View style={[styles.complianceAlertBox, styles.complianceAlertYellow]}>
              <MaterialCommunityIcons name="alert" size={20} color="#FACC15" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.complianceAlertTitleYellow}>⚠️ PERHATIAN KEPATUHAN MBG</Text>
                <Text style={styles.complianceAlertDesc}>
                  Menu Anda menggunakan bahan yang diawasi/dibatasi Kemenkes:
                </Text>
                {dibatasiItems.map(it => (
                  <Text key={it.id} style={styles.complianceAlertItem}>
                    • {it.nama} ({it.mbgNotes})
                  </Text>
                ))}
              </View>
            </View>
          );
        } else if (selectedItems.length > 0) {
          return (
            <View style={[styles.complianceAlertBox, styles.complianceAlertGreen]}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#4ADE80" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.complianceAlertTitleGreen}>✅ LOLOS REGULASI MBG</Text>
                <Text style={styles.complianceAlertDesc}>
                  Semua bahan menu terpilih adalah bahan segar & lokal yang direkomendasikan oleh BGN.
                </Text>
              </View>
            </View>
          );
        }
        return null;
      })()}

      {/* Stats Summary */}
      <View style={styles.resultStatGrid}>
        <View style={styles.rsCard}>
          <Text style={styles.rsLabel}>Total Porsi</Text>
          <Text style={[styles.rsValue, styles.blueText]}>{totalPorsi}</Text>
          <Text style={styles.rsSub}>{siswaNum} siswa + {spareNum} cad</Text>
        </View>
        <View style={styles.rsCard}>
          <Text style={styles.rsLabel}>Bahan Baku/Porsi</Text>
          <Text style={[styles.rsValue, isBudgetOk ? styles.greenText : styles.redText]}>Rp {totBiaya.toLocaleString('id')}</Text>
          <Text style={styles.rsSub}>Limit: Rp {budgetBB.toLocaleString('id')}</Text>
        </View>
        <View style={styles.rsCard}>
          <Text style={styles.rsLabel}>Total Belanja</Text>
          <Text style={[styles.rsValue, styles.orangeText]}>
            {totalBB >= 1000000 ? `${(totalBB/1000000).toFixed(1)} Jt` : `Rp ${totalBB.toLocaleString('id')}`}
          </Text>
          <Text style={styles.rsSub}>Untuk {totalPorsi} Porsi</Text>
        </View>
        <View style={styles.rsCard}>
          <Text style={styles.rsLabel}>Total Budget</Text>
          <Text style={[styles.rsValue, styles.greenText]}>
            {totalAnggaran >= 1000000 ? `${(totalAnggaran/1000000).toFixed(1)} Jt` : `Rp ${totalAnggaran.toLocaleString('id')}`}
          </Text>
          <Text style={styles.rsSub}>Overhead: {overhead}%</Text>
        </View>
      </View>

      {/* Target Acuan Gizi */}
      <Text style={styles.sectionTitle}>📊 Nilai Gizi Terhadap Target Utama</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Perbandingan Nutrisi vs {activeAkg.name}:</Text>
        
        {/* Energi Bar */}
        <View style={styles.gbrRow}>
          <Text style={styles.gbrLabel}>Energi</Text>
          <View style={styles.gbrBarTrack}>
            <View style={[styles.gbrBarFill, { width: `${Math.min(100, totKal/activeAkg.kal*100)}%`, backgroundColor: '#FACC15' }]} />
          </View>
          <Text style={styles.gbrValue}>{totKal} kkal ({Math.round(totKal/activeAkg.kal*100)}%)</Text>
        </View>

        {/* Protein Bar */}
        <View style={styles.gbrRow}>
          <Text style={styles.gbrLabel}>Protein</Text>
          <View style={styles.gbrBarTrack}>
            <View style={[styles.gbrBarFill, { width: `${Math.min(100, totProt/activeAkg.protein*100)}%`, backgroundColor: '#4ADE80' }]} />
          </View>
          <Text style={styles.gbrValue}>{totProt.toFixed(1)}g ({Math.round(totProt/activeAkg.protein*100)}%)</Text>
        </View>

        {/* Karbohidrat Bar */}
        <View style={styles.gbrRow}>
          <Text style={styles.gbrLabel}>Karbohidrat</Text>
          <View style={styles.gbrBarTrack}>
            <View style={[styles.gbrBarFill, { width: `${Math.min(100, totKar/activeAkg.karbo*100)}%`, backgroundColor: '#60A5FA' }]} />
          </View>
          <Text style={styles.gbrValue}>{totKar.toFixed(1)}g ({Math.round(totKar/activeAkg.karbo*100)}%)</Text>
        </View>

        {/* Lemak Bar */}
        <View style={styles.gbrRow}>
          <Text style={styles.gbrLabel}>Lemak</Text>
          <View style={styles.gbrBarTrack}>
            <View style={[styles.gbrBarFill, { width: `${Math.min(100, totLem/activeAkg.lemak*100)}%`, backgroundColor: '#FB923C' }]} />
          </View>
          <Text style={styles.gbrValue}>{totLem.toFixed(1)}g ({Math.round(totLem/activeAkg.lemak*100)}%)</Text>
        </View>
      </View>

      {/* DIAGRAM AKG KOMPARATIF SD & SMP (FITUR UTAMA) */}
      <Text style={styles.sectionTitle}>📈 Matriks AKG Lintas Sasaran (BGN Juknis 2025)</Text>
      <View style={styles.card}>
        <Text style={styles.hintText}>
          Tingkat kecukupan konsumsi gizi (Energi &amp; Protein) menu terpilih untuk seluruh kelompok sasaran:
        </Text>
        
        {Object.keys(AKG_DATA).map(key => {
          const g = AKG_DATA[key];
          const isUsiaActive = key === usia;
          const calPct = Math.round(totKal / g.kal * 100);
          const protPct = Math.round(totProt / g.protein * 100);

          let statusText = 'Sesuai';
          let statusColor = '#4ADE80';
          if (calPct < 90 || protPct < 90) {
            statusText = 'Kurang';
            statusColor = '#F87171';
          } else if (calPct > 110 || protPct > 110) {
            statusText = 'Lebih';
            statusColor = '#60A5FA';
          }

          return (
            <View 
              key={key} 
              style={[styles.matrixRow, isUsiaActive && styles.matrixRowActive]}
            >
              <View style={styles.matrixColInfo}>
                <Text style={styles.matrixAgeName}>
                  {g.name} {isUsiaActive ? '⭐️' : ''}
                </Text>
                <Text style={styles.matrixAgeSub}>Target: {g.kal} kkal / {g.protein}g</Text>
                <View style={[styles.smallBadge, { borderColor: statusColor }]}>
                  <Text style={[styles.smallBadgeText, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>
              
              <View style={styles.matrixColBars}>
                {/* Energi */}
                <View style={styles.matrixBarGroup}>
                  <Text style={styles.matrixBarLabel}>Energi</Text>
                  <View style={styles.matrixTrackSmall}>
                    <View style={[styles.matrixFillSmall, { width: `${Math.min(100, calPct)}%`, backgroundColor: statusColor }]} />
                  </View>
                  <Text style={styles.matrixBarPct}>{calPct}%</Text>
                </View>
                {/* Protein */}
                <View style={styles.matrixBarGroup}>
                  <Text style={styles.matrixBarLabel}>Protein</Text>
                  <View style={styles.matrixTrackSmall}>
                    <View style={[styles.matrixFillSmall, { width: `${Math.min(100, protPct)}%`, backgroundColor: statusColor }]} />
                  </View>
                  <Text style={styles.matrixBarPct}>{protPct}%</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* ANALISIS NARATIF PEMENUHAN GIZI */}
      <Text style={styles.sectionTitle}>📝 Analisis Naratif Pemenuhan Gizi</Text>
      {(() => {
        const selectedCategories = selectedItems.map(it => it.kat);
        const hasKarbo = selectedCategories.includes('karbo');
        const hasProtein = selectedCategories.includes('protein');
        const hasSayur = selectedCategories.includes('sayur');
        const hasBuah = selectedCategories.includes('buah');

        const missingStandard = [];
        if (!hasKarbo) missingStandard.push('Karbo harian');
        if (!hasProtein) missingStandard.push('Protein');
        if (!hasSayur) missingStandard.push('Sayuran');
        if (!hasBuah) missingStandard.push('Buah');

        const ageAkg = AKG_DATA[usia] || AKG_DATA['sd_besar'];
        const calPct = Math.round(totKal / ageAkg.kal * 100);
        const protPct = Math.round(totProt / ageAkg.protein * 100);

        let energyStatus = '';
        let energyAdvice = '';
        if (calPct < 90) {
          energyStatus = 'Kurang (Defisit)';
          energyAdvice = 'Energi porsi MBG berada di bawah 90% target BGN. Tambahkan porsi karbohidrat utama atau tambahkan komponen berminyak sehat.';
        } else if (calPct > 110) {
          energyStatus = 'Berlebih (Surplus)';
          energyAdvice = 'Energi porsi MBG melebihi 110% target BGN. Disarankan mengurangi porsi karbohidrat utama untuk mencegah obesitas.';
        } else {
          energyStatus = 'Optimal (Sesuai Standar)';
          energyAdvice = 'Kandungan energi sudah berada dalam rentang ideal (90% - 110%) sesuai regulasi Badan Gizi Nasional.';
        }

        let proteinStatus = '';
        let proteinAdvice = '';
        if (protPct < 90) {
          proteinStatus = 'Kurang (Defisit)';
          proteinAdvice = 'Kadar protein di bawah 90% target. Disarankan menambah lauk hewani atau ganti dengan menu bernutrisi protein tinggi.';
        } else if (protPct > 110) {
          proteinStatus = 'Tinggi (Surplus)';
          proteinAdvice = 'Kadar protein melebihi 110% target. Sangat baik untuk pemulihan dan tumbuh kembang anak.';
        } else {
          proteinStatus = 'Optimal (Sesuai Standar)';
          proteinAdvice = 'Kandungan protein memenuhi target kecukupan gizi harian (90% - 110%) secara seimbang.';
        }

        const fatCalPct = Math.round((totLem * 9) / (totKal || 1) * 100);
        let fatAdvice = '';
        if (fatCalPct > 35) {
          fatAdvice = 'Proporsi lemak cukup tinggi (>35% kalori). Batasi gorengan, gunakan teknik masak kukus/panggang.';
        } else {
          fatAdvice = 'Keseimbangan lemak baik, aman untuk penyerapan vitamin larut lemak.';
        }

        const fiberAdvice = totSerat < 3 
          ? 'Serat tergolong rendah (<3g). Disarankan menambah sayur berdaun hijau atau memilih buah kaya serat.'
          : 'Kandungan serat baik untuk kesehatan pencernaan siswa.';

        return (
          <View style={styles.card}>
            {/* Status Gizi Seimbang */}
            <View style={{ marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
              <Text style={[styles.label, { marginTop: 0, marginBottom: 4 }]}>Kelengkapan Piring Gizi Seimbang:</Text>
              {missingStandard.length > 0 ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="alert-circle" size={16} color="#FB923C" />
                  <Text style={{ color: '#FB923C', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                    Belum Lengkap (Kurang: {missingStandard.join(', ')})
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4ADE80" />
                  <Text style={{ color: '#4ADE80', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
                    Lengkap & Memenuhi Kriteria Porsi Seimbang
                  </Text>
                </View>
              )}
            </View>

            {/* Narasi Energi & Protein */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: '#A5ACCC', fontSize: 10, fontWeight: '800' }}>⚡ EVALUASI ENERGI ({calPct}%)</Text>
              <Text style={{ color: calPct < 90 || calPct > 110 ? '#FB923C' : '#4ADE80', fontSize: 12, fontWeight: '700', marginVertical: 2 }}>
                Status: {energyStatus}
              </Text>
              <Text style={{ color: '#8892B0', fontSize: 11.5, lineHeight: 15 }}>{energyAdvice}</Text>
            </View>

            <View style={{ marginBottom: 10, marginTop: 4 }}>
              <Text style={{ color: '#A5ACCC', fontSize: 10, fontWeight: '800' }}>🍗 EVALUASI PROTEIN ({protPct}%)</Text>
              <Text style={{ color: protPct < 90 || protPct > 110 ? '#FB923C' : '#4ADE80', fontSize: 12, fontWeight: '700', marginVertical: 2 }}>
                Status: {proteinStatus}
              </Text>
              <Text style={{ color: '#8892B0', fontSize: 11.5, lineHeight: 15 }}>{proteinAdvice}</Text>
            </View>

            {/* Keseimbangan Zat Gizi Makro Lainnya */}
            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.08)', paddingTop: 10, marginTop: 6 }}>
              <Text style={{ color: '#A5ACCC', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>💡 REKOMENDASI DIETETIK LAINNYA:</Text>
              <Text style={{ color: '#8892B0', fontSize: 11.5, lineHeight: 15, marginBottom: 4 }}>
                • <Text style={{ fontWeight: 'bold', color: '#F1F3F9' }}>Lemak:</Text> {fatAdvice}
              </Text>
              <Text style={{ color: '#8892B0', fontSize: 11.5, lineHeight: 15 }}>
                • <Text style={{ fontWeight: 'bold', color: '#F1F3F9' }}>Serat:</Text> {fiberAdvice}
              </Text>
            </View>
          </View>
        );
      })()}

      {/* ═══════════════════════════════════════
          ESTIMASI BAHAN BAKU LENGKAP (PER PORSI & TOTAL)
          ═══════════════════════════════════════ */}
      {(() => {
        const selectedProteins = selectedItems.filter(it => it.kat === 'protein');
        
        return (
          <View style={{ marginTop: 15 }}>
            {/* Tiga Card Overview */}
            <View style={styles.topInfoGrid}>
              {selectedProteins.length > 0 ? (
                selectedProteins.map(prot => {
                  const cardInfo = getProteinCardInfo(prot, totalPorsi);
                  return (
                    <View key={prot.id} style={[styles.topInfoCard, { backgroundColor: '#1E293B', borderColor: '#3B82F6', borderWidth: 1 }]}>
                      <Text style={[styles.topInfoLabel, { color: '#94A3B8' }]}>{cardInfo.title}</Text>
                      <Text style={[styles.topInfoValue, { color: '#3B82F6', fontSize: 16 }]}>{cardInfo.val}</Text>
                      <Text style={styles.topInfoSub}>{cardInfo.sub}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={[styles.topInfoCard, { backgroundColor: '#1E293B', borderColor: '#3B82F6', borderWidth: 1 }]}>
                  <Text style={[styles.topInfoLabel, { color: '#94A3B8' }]}>Kebutuhan Protein</Text>
                  <Text style={[styles.topInfoValue, { color: '#3B82F6', fontSize: 16 }]}>0 porsi</Text>
                  <Text style={styles.topInfoSub}>Pilih protein</Text>
                </View>
              )}
              <View style={styles.topInfoCard}>
                <Text style={styles.topInfoLabel}>Penerima manfaat</Text>
                <Text style={[styles.topInfoValue, { fontSize: 16 }]}>{totalPorsi.toLocaleString('id')} orang</Text>
                <Text style={styles.topInfoSub}>Siswa + Cadangan</Text>
              </View>
              <View style={styles.topInfoCard}>
                <Text style={styles.topInfoLabel}>Menu Lauk</Text>
                <Text style={[styles.topInfoValue, { fontSize: 13 }]}>{selectedProteins.map(it => it.nama).join(', ') || '—'}</Text>
                <Text style={styles.topInfoSub}>Pilihan Protein</Text>
              </View>
            </View>

            {/* Bahan Pelengkap Goreng/Katsu dkk */}
            {selectedProteins.map(prot => (
              <View key={prot.id}>
                {renderPelengkapCards(prot, totalPorsi)}
              </View>
            ))}

            {/* INTERACTIVE KITCHEN TIMELINE CARD */}
            <Text style={styles.sectionTitle}>🕒 TIMELINE OPERASIONAL DAPUR & DISTRIBUSI (BGN)</Text>
            <View style={[styles.card, { padding: 15, marginBottom: 15 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#F1F3F9', fontSize: 12.5, fontWeight: '700' }}>Jam Target {activeAkg.waktu} Siswa:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 6, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 8, paddingVertical: 4 }}>
                  <TextInput
                    style={{ color: '#FFF', width: 50, fontSize: 13, fontWeight: 'bold', textAlign: 'center', padding: 0 }}
                    value={jamMakanSiang}
                    onChangeText={setJamMakanSiang}
                    placeholder="11:30"
                    placeholderTextColor="#475569"
                  />
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                </View>
              </View>

              {(() => {
                const times = calculateTimeline(jamMakanSiang);
                return (
                  <View style={{ position: 'relative' }}>
                    <View style={{ position: 'absolute', left: 16, top: 12, bottom: 12, width: 2, backgroundColor: 'rgba(255,255,255,0.08)' }} />
                    
                    {/* Step 1: Mulai Masak */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#475569', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <MaterialCommunityIcons name="fire" size={16} color="#FB923C" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Mulai Masak & Persiapan Bahan</Text>
                        <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Jam {times.mulaiMasak} WIB (Estimasi durasi memasak 2 jam)</Text>
                      </View>
                    </View>

                    {/* Step 2: Selesai Masak / Plating */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <MaterialCommunityIcons name="silverware-clean" size={16} color="#3B82F6" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Selesai Masak & Mulai Pemorsian (Plating/QC)</Text>
                        <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Jam {times.pemorsian} WIB (QC organoleptik wajib selesai)</Text>
                      </View>
                    </View>

                    {/* Step 3: Distribusi */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#A855F7', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <MaterialCommunityIcons name="truck-delivery" size={16} color="#A855F7" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Distribusi & Pengiriman Makanan</Text>
                        <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Jam {times.distribusi} WIB (Kurir berangkat ke sekolah)</Text>
                      </View>
                    </View>

                    {/* Step 4: Makan Siang */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#4ADE80', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#4ADE80" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>Konsumsi {activeAkg.waktu} Siswa</Text>
                        <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Jam {times.makanSiang} WIB (Target konsumsi utama)</Text>
                      </View>
                    </View>

                    {/* Step 5: Batas Aman */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                        <MaterialCommunityIcons name="alert-decagram-outline" size={16} color="#EF4444" />
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold' }}>Batas Aman Konsumsi (Expiry Golden Hour)</Text>
                        <Text style={{ color: '#FCA5A5', fontSize: 11 }}>Jam {times.batasAman} WIB (Maksimal 3 jam setelah pemorsian)</Text>
                      </View>
                    </View>
                  </View>
                );
              })()}
            </View>

            {/* Tabel Bahan Baku Lengkap */}
            <Text style={styles.sectionTitle}>📋 ESTIMASI BAHAN BAKU LENGKAP (PER PORSI & TOTAL)</Text>
            <View style={styles.card}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>Bahan baku</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.9, textAlign: 'center' }]}>Net/Orang</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.6, textAlign: 'center' }]}>BDD</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Belanja (Gross)</Text>
                <Text style={[styles.tableHeaderCell, { flex: 0.7, textAlign: 'center' }]}>Satuan</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.8, textAlign: 'right' }]}>Catatan</Text>
              </View>

              {getConsolidatedIngredients(selectedItems, totalPorsi).map((ing, idx) => {
                const yieldInfo = getYieldInfo(ing.nama);
                const bddPct = Math.round(yieldInfo.bdd * 100);
                return (
                  <View key={idx} style={[styles.tableRow, ing.isUtama && { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: 4, paddingHorizontal: 4 }]}>
                    <View style={{ flex: 1.8, flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.tableCellName, { color: '#FFF', fontSize: 11.5 }]} numberOfLines={1}>{ing.nama}</Text>
                      {ing.isUtama && (
                        <View style={styles.utamaBadge}>
                          <Text style={styles.utamaBadgeText}>utama</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tableCellPortion, { flex: 0.9, textAlign: 'center', color: '#A5ACCC' }]}>
                      {ing.qtyPerPorsi} {ing.unit}
                    </Text>
                    <Text style={[styles.tableCellPortion, { flex: 0.6, textAlign: 'center', color: '#60A5FA', fontWeight: 'bold' }]}>
                      {bddPct}%
                    </Text>
                    <Text style={[styles.tableCellTotal, { flex: 1.2, textAlign: 'center', color: '#4ADE80', fontWeight: '800' }]}>
                      {formatGrossTotal(ing.qtyPerPorsi, yieldInfo.bdd, ing.unit, totalPorsi)}
                    </Text>
                    <Text style={[styles.tableCellPortion, { flex: 0.7, textAlign: 'center', color: '#A5ACCC' }]}>
                      {getGrossSatuan(ing.qtyPerPorsi, yieldInfo.bdd, ing.unit, totalPorsi)}
                    </Text>
                    <Text style={[styles.tableCellPortion, { flex: 1.8, textAlign: 'right', fontSize: 10, color: '#94A3B8' }]} numberOfLines={1}>
                      {ing.catatan}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })()}

      {/* Rincian Biaya per Porsi */}
      <Text style={styles.sectionTitle}>💳 Rincian biaya per porsi</Text>
      <View style={styles.card}>
        {selectedItems.map(item => (
          <View key={item.id} style={styles.costLine}>
            <Text style={styles.costLineLabel}>{item.nama}</Text>
            <Text style={styles.costLineValue}>Rp {item.harga.toLocaleString('id')}</Text>
          </View>
        ))}
        {hasCooked && (
          <View style={styles.costLine}>
            <Text style={styles.costLineLabel}>Minyak goreng & bumbu</Text>
            <Text style={styles.costLineValue}>Rp {bumbuCost.toLocaleString('id')}</Text>
          </View>
        )}
        
        {/* Divider */}
        <View style={styles.costDivider} />
        
        <View style={styles.costLine}>
          <Text style={[styles.costLineLabel, { fontWeight: '700', color: '#FFF' }]}>Total bahan baku</Text>
          <Text style={[styles.costLineValue, { fontWeight: '800', color: isBudgetOk ? '#4ADE80' : '#F87171' }]}>
            Rp {totBiaya.toLocaleString('id')}
          </Text>
        </View>
        <View style={styles.costLine}>
          <Text style={styles.costLineLabel}>Overhead operasional ({overhead}%)</Text>
          <Text style={styles.costLineValue}>Rp {(Math.round(budgetNum * overhead / 100)).toLocaleString('id')}</Text>
        </View>
        
        {/* Divider */}
        <View style={styles.costDivider} />
        
        <View style={styles.costLine}>
          <Text style={[styles.totalCostLabel, { color: '#FFF', fontSize: 15 }]}>Total per porsi</Text>
          <Text style={[styles.totalCostValue, { color: (totBiaya + Math.round(budgetNum * overhead / 100)) <= budgetNum ? '#4ADE80' : '#F87171', fontSize: 16 }]}>
            Rp {(totBiaya + Math.round(budgetNum * overhead / 100)).toLocaleString('id')}
          </Text>
        </View>
        <View style={styles.costLine}>
          <Text style={[styles.costLineLabel, { fontSize: 11 }]}>Budget tersedia per porsi</Text>
          <Text style={[styles.costLineValue, { fontSize: 11, color: '#A5ACCC' }]}>Rp {budgetNum.toLocaleString('id')}</Text>
        </View>
      </View>

      {/* Rincian Kandungan Gizi Menu */}
      <Text style={styles.sectionTitle}>📊 Rincian zat gizi per porsi</Text>
      <View style={styles.card}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={{ width: 450 }}>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 6, marginBottom: 6 }}>
              <Text style={{ flex: 2, color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>Menu</Text>
              <Text style={{ flex: 1.2, color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>Energi</Text>
              <Text style={{ flex: 1, color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>Prot</Text>
              <Text style={{ flex: 1, color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>Karbo</Text>
              <Text style={{ flex: 1, color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>Lemak</Text>
              <Text style={{ flex: 1, color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>Serat</Text>
            </View>

            {/* Menu Items Rows */}
            {selectedItems.map(item => (
              <View key={item.id} style={{ flexDirection: 'row', paddingVertical: 4 }}>
                <Text style={{ flex: 2, color: '#FFF', fontSize: 11 }} numberOfLines={1}>{item.nama}</Text>
                <Text style={{ flex: 1.2, color: '#A5ACCC', fontSize: 11, textAlign: 'right' }}>{item.kalori} kkal</Text>
                <Text style={{ flex: 1, color: '#A5ACCC', fontSize: 11, textAlign: 'right' }}>{item.protein}g</Text>
                <Text style={{ flex: 1, color: '#A5ACCC', fontSize: 11, textAlign: 'right' }}>{item.karbo}g</Text>
                <Text style={{ flex: 1, color: '#A5ACCC', fontSize: 11, textAlign: 'right' }}>{item.lemak}g</Text>
                <Text style={{ flex: 1, color: '#A5ACCC', fontSize: 11, textAlign: 'right' }}>{item.serat}g</Text>
              </View>
            ))}

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 6 }} />

            {/* Total Row */}
            <View style={{ flexDirection: 'row', paddingVertical: 2 }}>
              <Text style={{ flex: 2, color: '#FFF', fontSize: 11, fontWeight: '700' }}>Total Aktual</Text>
              <Text style={{ flex: 1.2, color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{totKal} kkal</Text>
              <Text style={{ flex: 1, color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{totProt}g</Text>
              <Text style={{ flex: 1, color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{totKar}g</Text>
              <Text style={{ flex: 1, color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{totLem}g</Text>
              <Text style={{ flex: 1, color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'right' }}>{totSerat}g</Text>
            </View>

            {/* Target AKG Row */}
            <View style={{ flexDirection: 'row', paddingVertical: 2 }}>
              <Text style={{ flex: 2, color: '#60A5FA', fontSize: 10, fontWeight: '700' }}>Target AKG ({usia})</Text>
              <Text style={{ flex: 1.2, color: '#60A5FA', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>{activeAkg.kal} kkal</Text>
              <Text style={{ flex: 1, color: '#60A5FA', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>{activeAkg.protein}g</Text>
              <Text style={{ flex: 1, color: '#60A5FA', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>{activeAkg.karbo}g</Text>
              <Text style={{ flex: 1, color: '#60A5FA', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>{activeAkg.lemak}g</Text>
              <Text style={{ flex: 1, color: '#60A5FA', fontSize: 10, fontWeight: '700', textAlign: 'right' }}>{activeAkg.serat || '—'}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={generatePDFReport}>
          <MaterialCommunityIcons name="printer" size={18} color="#000" />
          <Text style={styles.primaryButtonText}>Cetak Laporan / PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ghostButton, { marginTop: 10 }]} onPress={handleExportCSV}>
          <MaterialCommunityIcons name="share-variant" size={18} color="#A5ACCC" />
          <Text style={styles.ghostButtonText}>Bagikan Data (CSV)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ghostButton, { marginTop: 10, borderColor: '#F87171' }]} onPress={() => setActiveTab(2)}>
          <Text style={[styles.ghostButtonText, { color: '#F87171' }]}>← Kembali Ubah Menu</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ═══════════════════════════════════════
  //  GIZSEE CALCULATOR LOGIC
  // ═══════════════════════════════════════

  const handleUpdateCalculatorRowWeight = (index, berat) => {
    const updatedRows = [...calculatorRows];
    if (updatedRows[index]) {
      const portion = parseFloat(berat) || 0;
      const factor = portion / 100;
      updatedRows[index] = {
        ...updatedRows[index],
        berat: berat,
        kalori: Math.round((updatedRows[index].baseKalori || 0) * factor),
        protein: parseFloat(((updatedRows[index].baseProtein || 0) * factor).toFixed(1)),
        karbo: parseFloat(((updatedRows[index].baseKarbo || 0) * factor).toFixed(1)),
        lemak: parseFloat(((updatedRows[index].baseLemak || 0) * factor).toFixed(1)),
        serat: parseFloat(((updatedRows[index].baseSerat || 0) * factor).toFixed(1))
      };
      setCalculatorRows(updatedRows);
    }
  };

  const handleDeleteCalculatorRow = (index) => {
    const updatedRows = calculatorRows.filter((_, idx) => idx !== index);
    if (updatedRows.length === 0) {
      setCalculatorRows([
        { id: String(Date.now()), nama: '', berat: '', kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0, baseKalori: 0, baseProtein: 0, baseKarbo: 0, baseLemak: 0, baseSerat: 0, mbgStatus: 'aman', mbgNotes: '', icon: 'rice' }
      ]);
    } else {
      setCalculatorRows(updatedRows);
    }
  };

  const handleSaveCalculator = () => {
    const validRows = calculatorRows.filter(row => row.nama.trim() !== '' && parseFloat(row.berat) > 0);
    if (validRows.length === 0) {
      Alert.alert('Gagal Menyimpan', 'Silakan isi setidaknya satu bahan makanan dengan berat yang valid.');
      return;
    }

    let totKal = 0, totProt = 0, totKar = 0, totLem = 0, totSer = 0;
    validRows.forEach(row => {
      totKal += row.kalori || 0;
      totProt += row.protein || 0;
      totKar += row.karbo || 0;
      totLem += row.lemak || 0;
      totSer += row.serat || 0;
    });

    const newHistoryItem = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString('id', { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('id', { day: '2-digit', month: 'short' }),
      rows: validRows,
      totals: {
        kalori: totKal,
        protein: parseFloat(totProt.toFixed(1)),
        karbo: parseFloat(totKar.toFixed(1)),
        lemak: parseFloat(totLem.toFixed(1)),
        serat: parseFloat(totSer.toFixed(1))
      }
    };

    setCalculatorHistory([newHistoryItem, ...calculatorHistory]);
    setCalculatorRows([
      { id: String(Date.now()), nama: '', berat: '', kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0, baseKalori: 0, baseProtein: 0, baseKarbo: 0, baseLemak: 0, baseSerat: 0, mbgStatus: 'aman', mbgNotes: '', icon: 'rice', kat: '' }
    ]);
    Alert.alert('Tersimpan', 'Hasil perhitungan berhasil disimpan ke dalam Riwayat.');
  };

  const handleLoadHistoryToCalculator = (item) => {
    if (item && item.rows && item.rows.length > 0) {
      setCalculatorRows(item.rows);
      Alert.alert('Dipulihkan', 'Data riwayat berhasil dimuat kembali ke kalkulator aktif.');
    }
  };

  const handleDeleteHistoryItem = (id) => {
    setCalculatorHistory(prev => prev.filter(x => x.id !== id));
  };

  const handleAIParseInput = async (rawText) => {
    if (!rawText.trim()) {
      Alert.alert('Gagal', 'Silakan masukkan nama menu dan beratnya. Contoh: "Sawi gulung isi tahu : 54g"');
      return;
    }

    setIsAiLoading(true);
    setAiExplanation('');
    setAiIngredients([]);

    try {
      const localApiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
      const localGeminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      let response;
      let useProxy = true;
      let directSuccess = false;

      try {
        response = await fetch('https://agrika.vercel.app/api/parse-recipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: rawText
          })
        });
      } catch (proxyError) {
        console.log('Failed to fetch from Vercel proxy, falling back to direct API call:', proxyError);
        useProxy = false;
      }

      // Fallback: If proxy call fails or returns non-200, try local API keys
      if (!useProxy || !response || response.status !== 200) {
        const systemPrompt = `You are a professional Nutritionist AI Assistant for the Indonesian Free Nutritious Meal (MBG) program.
Your job is to analyze the user's query, which can be:
A) A single recipe query (e.g. "sawi gulung isi tahu seperti di tiktok : 54g" or "kalau sawi gulung telur seberat 54 gram?")
B) A list of multiple food items with their respective weights (e.g. "Nasi putih 134 gr\n Ayam woku kemangi 77 gr\n Perkedel tahu 36 gr\n Sawi isi tahu 41 gr\n Anggur 48 gr")

Tasks for Case A (Single Recipe):
1. Extract the actual menu name and the total weight (in grams). If no weight is mentioned, assume 100 grams.
2. Determine typical raw ingredient proportions (ratios summing up exactly to 1.0).
3. Calculate the weight ("berat") in grams for each ingredient based on the proportions (e.g. totalWeight * ratio).
4. Suggest the best search keywords for each ingredient to query the Kemenkes TKPI database.

Tasks for Case B (List of Multiple Items):
1. Parse all items and their individual input weights.
2. Sum all the individual weights to compute the "totalWeight".
3. For compound recipe items (e.g. "Ayam woku", "Sawi isi tahu", "Perkedel tahu", "Telur semur bali", "Tempe goreng"), break them down into their 2-3 PRIMARY ingredients only using realistic culinary ratios.
   - For example, a fried item like "Tempe goreng : 25 gr" should be broken down into Tempe (~75-80% of weight, i.e. 18.8g) and Minyak kelapa sawit (~20-25% of weight, i.e. 6.2g).
   - A wet/boiled dish like "Telur semur bali : 75 gr" should be broken down into Telur ayam (~80-95% of weight, i.e. 60-70g) and Minyak kelapa sawit / bumbu (~5-20% of weight, e.g. 5-15g).
   - A vegetable mix like "Tumis labu siam jagung putren : 34 gr" should be broken down into Labu siam (~50% of weight, i.e. 17g) and Jagung muda (~40% of weight, i.e. 13.6g) and Minyak (~10% of weight, i.e. 3.4g). Keep the sum of broken-down weights exactly equal to the item's input weight!
4. For simple items (e.g. "Nasi putih", "Anggur", "Salak"), DO NOT break them down. Keep them as a single ingredient and keep their weight exactly as input (e.g. "Salak : 76 gr" must have weight exactly 76g, not 76.2g!).
5. For each ingredient row in the output, calculate:
   - "berat": the exact absolute weight in grams (e.g. 158 for Nasi putih 158g, 76 for Salak 76g).
   - "ratio": the ratio relative to the grand totalWeight (ratio = berat / totalWeight).
6. Ensure that the sum of "berat" of all ingredients in the list equals "totalWeight" exactly, and the sum of "ratio" equals 1.0 exactly.

Strict Rules for Ingredients:
- ONLY output the primary, macro-contributing ingredients (e.g. meat, main vegetable, main carb source, cooking oil).
- DO NOT list optional binders, spices, condiments (like shallots, garlic, chili, salt), or side ingredients as separate rows.
- Use standard, clean search keywords that exist in typical food databases:
  - "Nasi" or "Nasi putih" -> "nasi putih"
  - "Jagung putren" / "Jagung muda" -> "jagung muda, segar"
  - "Telur" -> "telur ayam ras, segar"
  - "Salak" -> "salak, segar"
  - "Tempe" -> "tempe pasar"
- Ensure keywords are clean and simple without unnecessary extra adjectives.

Provide a friendly explanation in casual youth Indonesian with emojis.
Respond ONLY with a valid JSON object. Do not include any explanations outside of the JSON. Do not include markdown code block formatting.

Example Output format:
{
  "menuName": "Sawi gulung isi tahu",
  "totalWeight": 54,
  "explanation": "Ooh sawi gulung isi tahu yang viral di TikTok itu ya! Sawi putih dikukus lalu diisi tahu di tengahnya. Menyehatkan banget buat adik-adik di sekolah! 🥬✨",
  "ingredients": [
    {
      "nama": "Sawi putih",
      "berat": 35.1,
      "ratio": 0.65,
      "searchKeyword": "sawi putih"
    },
    {
      "nama": "Tahu putih",
      "berat": 18.9,
      "ratio": 0.35,
      "searchKeyword": "tahu"
    }
  ]
}`;

        // 1. Try Gemini Direct API Fallback (CORS-friendly on Web)
        if (localGeminiApiKey && localGeminiApiKey !== 'your_gemini_api_key_here') {
          try {
            console.log('Attempting direct Gemini API call fallback...');
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${localGeminiApiKey}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `User query: "${rawText}"`
                  }]
                }],
                systemInstruction: {
                  parts: [{
                    text: systemPrompt
                  }]
                },
                generationConfig: {
                  responseMimeType: "application/json"
                }
              })
            });

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content && geminiData.candidates[0].content.parts[0]) {
                const responseText = geminiData.candidates[0].content.parts[0].text.trim();
                response = {
                  ok: true,
                  status: 200,
                  json: async () => ({
                    content: [{
                      text: responseText
                    }]
                  })
                };
                directSuccess = true;
                console.log('Direct Gemini API fallback successful!');
              }
            } else {
              const geminiErrText = await geminiResponse.text();
              console.log('Gemini API returned error status:', geminiResponse.status, geminiErrText);
            }
          } catch (geminiErr) {
            console.log('Direct Gemini API fallback failed with error:', geminiErr);
          }
        }

        // 2. Try Claude Direct API Fallback (Standard fallback, might encounter CORS on Web)
        if (!directSuccess) {
          if (Platform.OS === 'web') {
            if (response) {
              const errJson = await response.json().catch(() => ({}));
              const apiError = errJson.error || `HTTP ${response.status}`;
              throw new Error(apiError);
            } else {
              throw new Error('Koneksi ke Vercel proxy gagal.');
            }
          }

          if (!localApiKey || localApiKey === 'your_claude_api_key_here') {
            const errMsg = response ? `Vercel Proxy Error (${response.status})` : 'Koneksi ke Vercel proxy gagal dan tidak ada API key lokal.';
            throw new Error(errMsg);
          }

          console.log('Attempting direct Claude API call fallback...');
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': localApiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-3-5-haiku-20241022',
              max_tokens: 1024,
              messages: [{ role: 'user', content: `User query: "${rawText}"` }],
              system: systemPrompt
            })
          });
        }
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text.trim();
      
      // Strip markdown code block formatting if present
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(responseText);
      const totalWeight = parseFloat(parsed.totalWeight) || 100;
      const matchedRows = [];
      
      const ingredients = parsed.ingredients || [];
      if (!Array.isArray(ingredients)) {
        throw new Error('Respon AI tidak menyertakan daftar bahan makanan.');
      }
      
      ingredients.forEach((ing, index) => {
        const targetWeight = ing.berat !== undefined ? parseFloat(ing.berat) : totalWeight * (ing.ratio || 0);
        const cleanKeyword = ing.searchKeyword.toLowerCase().trim();
        
        // Find best match in local TKPI database
        let found = TKPI_DATABASE.find(x => x.nama.toLowerCase() === cleanKeyword);
        if (!found) {
          // Use advanced keyword matching with ranking score directly for partial matches
          const words = cleanKeyword.split(/\s+/).filter(w => w.length > 1);
          if (words.length > 0) {
            let bestMatch = null;
            let maxScore = -9999;
            const genericTerms = ['daging', 'mentah', 'segar', 'matang', 'rebus', 'kukus', 'goreng', 'kering', 'bubuk', 'daun', 'biji', 'buah', 'tepung', 'minyak', 'air', 'muda', 'tua', 'putih', 'merah', 'kuning', 'hijau'];
            const processingTerms = ['goreng', 'rebus', 'kukus', 'kering', 'bakar', 'panggang', 'asin', 'olahan', 'awetan'];
            
            for (const x of TKPI_DATABASE) {
              const nameLower = x.nama.toLowerCase();
              const nameLowerClean = nameLower.replace(/\(.*\)/g, '').trim();
              const nameWords = nameLowerClean.split(/[\s,()\/]+/).filter(w => w.length > 1);
              let score = 0;
              
              words.forEach((word, idx) => {
                if (nameLowerClean.includes(word)) {
                  const isStart = nameLowerClean.startsWith(word) || nameLowerClean.split('/').some(part => part.trim().startsWith(word));
                  if (idx === 0 && isStart && !genericTerms.includes(word)) {
                    score += 15; // Noun startsWith synonym match (e.g. singkong, tahu)
                  } else if (idx === 0 && !genericTerms.includes(word)) {
                    score += 8;  // Noun includes match
                  } else if (genericTerms.includes(word)) {
                    score += 1;  // Generic term (daging, minyak, etc.)
                  } else {
                    score += 5;  // Other specific terms
                  }
                }
              });
              
              // Penalty for extra words in DB name not present in search keyword
              nameWords.forEach(w => {
                if (!words.includes(w)) {
                  if (genericTerms.includes(w)) {
                    score -= 1.5; // Penalty for extra generic terms (e.g. minyak, segar)
                  } else {
                    score -= 4.0; // Penalty for extra specific terms
                  }
                }
              });
              
              // Penalty for extra processing terms (e.g. goreng, rebus) if not requested
              processingTerms.forEach(term => {
                if (nameLowerClean.includes(term) && !cleanKeyword.includes(term)) {
                  score -= 3;
                }
              });
              
              // Heavy penalty for leaf ('daun') crops if not specifically looking for a leaf
              if (nameLowerClean.startsWith('daun') && !cleanKeyword.startsWith('daun')) {
                score -= 10;
              }

              const cleanKeywordLower = cleanKeyword.toLowerCase();

              // Eggs: Penalize duck, quail, turtle, maleo, salted eggs if looking for generic eggs
              if (cleanKeywordLower.includes('telur') && 
                  !cleanKeywordLower.includes('bebek') && 
                  !cleanKeywordLower.includes('puyuh') && 
                  !cleanKeywordLower.includes('penyu') && 
                  !cleanKeywordLower.includes('maleo') &&
                  !cleanKeywordLower.includes('asin')) {
                if (nameLowerClean.includes('bebek') || 
                    nameLowerClean.includes('puyuh') || 
                    nameLowerClean.includes('penyu') || 
                    nameLowerClean.includes('maleo') ||
                    nameLowerClean.includes('asin')) {
                  score -= 20;
                }
              }

              // Milk: Penalize camel, horse, soy, buffalo milk if looking for generic milk
              if (cleanKeywordLower.includes('susu') && 
                  !cleanKeywordLower.includes('kambing') && 
                  !cleanKeywordLower.includes('kuda') && 
                  !cleanKeywordLower.includes('kedelai') && 
                  !cleanKeywordLower.includes('kerbau')) {
                if (nameLowerClean.includes('kambing') || 
                    nameLowerClean.includes('kuda') || 
                    nameLowerClean.includes('kerbau') ||
                    nameLowerClean.includes('kedelai')) {
                  score -= 20;
                }
              }

              // Meat (Daging / Ayam / Sapi / Kambing)
              const meatKeywords = ['daging', 'ayam', 'sapi', 'kambing'];
              const hasMeatKeyword = meatKeywords.some(kw => cleanKeywordLower.includes(kw));

              if (hasMeatKeyword) {
                // Penalize offal/organs if not explicitly requested
                const offalTerms = ['ampela', 'hati', 'usus', 'jantung', 'paru', 'babat', 'otak', 'limpa', 'dideh', 'darah', 'tetelan', 'lemak'];
                const requestedOffal = offalTerms.some(term => cleanKeywordLower.includes(term));
                if (!requestedOffal) {
                  if (offalTerms.some(term => nameLowerClean.includes(term))) {
                    score -= 20;
                  }
                }

                // Penalize obscure wildlife or less common meats if looking for generic meat
                const obscureMeats = ['kuda', 'rusa', 'kelinci', 'penyu', 'anjing', 'ular', 'biawak', 'celeng', 'hutan', 'bebek', 'maleo'];
                const requestedObscure = obscureMeats.some(term => cleanKeywordLower.includes(term));
                if (!requestedObscure) {
                  if (obscureMeats.some(term => nameLowerClean.includes(term))) {
                    score -= 20;
                  }
                }
              }
              
              // Extra points if the exact cleanKeyword is present in full
              if (nameLowerClean.includes(cleanKeyword)) {
                score += 15;
              }
              
              // Tie-breaker: prefer shorter names closer to search query length
              if (score > 0) {
                const lengthDiff = Math.abs(nameLowerClean.length - cleanKeyword.length);
                score += (100 - lengthDiff) * 0.01;
              }
              
              if (score > maxScore) {
                maxScore = score;
                bestMatch = x;
              }
            }
            
            if (maxScore > 2) {
              found = bestMatch;
            }
          }
        }
        
        if (!found) {
          found = {
            nama: ing.nama,
            kalori: 100, protein: 1, karbo: 10, lemak: 1, serat: 1,
            mbgStatus: 'aman', mbgNotes: 'Bahan kustom (tidak ada di TKPI)', icon: 'food', kat: 'sayur'
          };
        }
        
        const factor = targetWeight / 100;
        matchedRows.push({
          id: `ai-${Date.now()}-${index}`,
          nama: found.nama,
          berat: String(targetWeight.toFixed(1)),
          kalori: Math.round((found.kalori || 0) * factor),
          protein: parseFloat(((found.protein || 0) * factor).toFixed(1)),
          karbo: parseFloat(((found.karbo || 0) * factor).toFixed(1)),
          lemak: parseFloat(((found.lemak || 0) * factor).toFixed(1)),
          serat: parseFloat(((found.serat || 0) * factor).toFixed(1)),
          baseKalori: found.kalori || 0,
          baseProtein: found.protein || 0,
          baseKarbo: found.karbo || 0,
          baseLemak: found.lemak || 0,
          baseSerat: found.serat || 0,
          mbgStatus: found.mbgStatus || 'aman',
          mbgNotes: found.mbgNotes || '',
          icon: found.icon || 'leaf',
          kat: found.kat || 'sayur'
        });
      });
      
      setAiExplanation(parsed.explanation);
      setAiIngredients(matchedRows);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Memproses AI', `Terjadi error saat menghubungi Asisten AI: ${error.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiIngredients = () => {
    if (aiIngredients.length === 0) return;
    
    setCalculatorRows(prev => {
      const cleanPrev = prev.filter(r => r.nama.trim() !== '');
      return [...cleanPrev, ...aiIngredients];
    });
    
    setAiInputText('');
    setAiExplanation('');
    setAiIngredients([]);
    Alert.alert('Berhasil! 💕', 'Bahan hasil rekomendasi AI berhasil dimasukkan ke tabel kalkulator aktif kita.');
  };

  const handleScaleToTargetAkg = () => {
    let totKal = 0;
    let totProt = 0;
    let totKar = 0;
    let totLem = 0;

    calculatorRows.forEach(row => {
      totKal += row.kalori || 0;
      totProt += row.protein || 0;
      totKar += row.karbo || 0;
      totLem += row.lemak || 0;
    });

    if (totKal <= 0) {
      Alert.alert('Info', 'Tambahkan bahan makanan terlebih dahulu dengan berat > 0.');
      return;
    }

    const targetAkg = AKG_DATA[calcTargetUsia] || AKG_DATA['sd_besar'];
    const targetKal = targetAkg.kal || 600;
    const targetProt = targetAkg.protein || 15;
    const targetKar = targetAkg.karbo || 80;
    const targetLem = targetAkg.lemak || 20;

    // We want to find a scaling factor 'f' that minimizes the sum of squared relative errors:
    // E(f) = sum_n (f * A_n / T_n - 1)^2
    // Let X_n = A_n / T_n
    // The analytical minimum is at f = sum(X_n) / sum(X_n^2)
    
    let sumX = 0;
    let sumX2 = 0;

    // 1. Kalori
    if (totKal > 0 && targetKal > 0) {
      const x = totKal / targetKal;
      sumX += x;
      sumX2 += x * x;
    }
    // 2. Protein
    if (totProt > 0 && targetProt > 0) {
      const x = totProt / targetProt;
      sumX += x;
      sumX2 += x * x;
    }
    // 3. Karbohidrat
    if (totKar > 0 && targetKar > 0) {
      const x = totKar / targetKar;
      sumX += x;
      sumX2 += x * x;
    }
    // 4. Lemak
    if (totLem > 0 && targetLem > 0) {
      const x = totLem / targetLem;
      sumX += x;
      sumX2 += x * x;
    }

    let factor = 1;
    if (sumX2 > 0) {
      factor = sumX / sumX2;
    }

    // Round factor to 3 decimal places for stability
    factor = Math.round(factor * 1000) / 1000;

    if (factor <= 0) {
      Alert.alert('Error', 'Gagal menghitung faktor skala yang valid.');
      return;
    }

    const updatedRows = calculatorRows.map(row => {
      if (!row.nama || !row.berat) return row;
      const curBerat = parseFloat(row.berat);
      if (isNaN(curBerat) || curBerat <= 0) return row;
      const newBerat = parseFloat((curBerat * factor).toFixed(1));
      
      return {
        ...row,
        berat: String(newBerat),
        kalori: (row.baseKalori || 0) * (newBerat / 100),
        protein: (row.baseProtein || 0) * (newBerat / 100),
        karbo: (row.baseKarbo || 0) * (newBerat / 100),
        lemak: (row.baseLemak || 0) * (newBerat / 100),
        serat: (row.baseSerat || 0) * (newBerat / 100),
      };
    });

    setCalculatorRows(updatedRows);

    const newKalPct = Math.round((totKal * factor) / targetKal * 100);
    const newProtPct = Math.round((totProt * factor) / targetProt * 100);
    const newKarPct = Math.round((totKar * factor) / targetKar * 100);
    const newLemPct = Math.round((totLem * factor) / targetLem * 100);

    Alert.alert(
      'Porsi Disesuaikan Seimbang! 💕', 
      `Takaran porsi disesuaikan (dikali ${factor.toFixed(2)}x) agar paling seimbang memenuhi seluruh AKG target:\n\n` +
      `• Energi: ${newKalPct}% dari target (${Math.round(totKal * factor)}/${targetKal} kkal)\n` +
      `• Protein: ${newProtPct}% dari target (${(totProt * factor).toFixed(1)}/${targetProt}g)\n` +
      `• Karbohidrat: ${newKarPct}% dari target (${(totKar * factor).toFixed(1)}/${targetKar}g)\n` +
      `• Lemak: ${newLemPct}% dari target (${(totLem * factor).toFixed(1)}/${targetLem}g)`
    );
  };

  const handleExportToMenu = () => {
    const validRows = calculatorRows.filter(row => row.nama.trim() !== '' && parseFloat(row.berat) > 0);
    if (validRows.length === 0) {
      Alert.alert('Gagal Ekspor', 'Silakan isi setidaknya satu bahan makanan dengan berat yang valid.');
      return;
    }

    const newCustomMenus = [];
    const newRecipeDetails = {};
    const nextSelected = { ...selected };

    // Group valid rows by category
    const rowsByCategory = {};
    validRows.forEach(row => {
      const kat = row.kat || 'protein';
      if (!rowsByCategory[kat]) {
        rowsByCategory[kat] = [];
      }
      rowsByCategory[kat].push(row);
    });

    const timestamp = Date.now();

    // For each category, create custom menu items and update selected
    Object.keys(rowsByCategory).forEach(kat => {
      const rows = rowsByCategory[kat];
      const exportedIds = [];
      
      rows.forEach((row, idx) => {
        const id = `custom-calc-${timestamp}-${kat}-${idx}`;
        
        // Attempt to get price
        const estimatedPrice = getIngredientCost(row.nama, parseFloat(row.berat) || 0, 'g') || 0;
        
        const newItem = {
          id,
          icon: row.icon || '🍽️',
          nama: `${row.nama} (${row.berat}g)`,
          porsi: '1 Porsi',
          kalori: row.kalori || 0,
          protein: row.protein || 0,
          karbo: row.karbo || 0,
          lemak: row.lemak || 0,
          serat: row.serat || 0,
          harga: estimatedPrice,
          kat: kat,
          mbgStatus: row.mbgStatus || 'aman',
          mbgNotes: row.mbgNotes || 'Diekspor dari kalkulator harian.'
        };
        
        newCustomMenus.push(newItem);
        exportedIds.push(id);
        
        // Save recipe breakdown
        newRecipeDetails[id] = {
          utama: {
            nama: row.nama,
            qty: parseFloat(row.berat) || 0,
            unit: 'g',
            catatan: 'Diekspor dari Kalkulator Harian'
          }
        };
      });
      
      // Set the selected items for this category to the exported ones (replacing previous selection)
      nextSelected[kat] = exportedIds;
    });

    // Update state
    setCustomMenus(prev => [...prev, ...newCustomMenus]);
    setCustomRecipeDetails(prev => ({ ...prev, ...newRecipeDetails }));
    setSelected(nextSelected);

    Alert.alert(
      'Ekspor Sukses! 💕',
      `Berhasil mengekspor ${validRows.length} bahan makanan ke Halaman Menu kita dan otomatis terpilih.\n\nYuk lihat hasilnya langsung di halaman Hasil Analisa!`,
      [
        {
          text: 'Nanti Dulu',
          style: 'cancel'
        },
        {
          text: 'Lihat Analisa',
          onPress: () => setActiveTab(3)
        }
      ]
    );
  };

  const generateNutritionNarrative = (totals, target) => {
    const { kalori, protein, lemak, karbo } = totals;
    const targetKal = target.kal || target.kalori || 600;
    const targetProt = target.protein || 15;
    const targetLem = target.lemak || 19.5;
    const targetKar = target.karbo || 90;

    if (kalori === 0) {
      return {
        verdict: 'Silakan isi bahan makanan',
        color: '#626C90',
        narrative: 'Tambahkan bahan makanan dari Kamus Gizi TKPI Kemenkes di atas dan input beratnya dalam gram untuk melihat analisis pemenuhan gizi rinci di sini.'
      };
    }

    const pctKal = (kalori / targetKal) * 100;
    const pctProt = (protein / targetProt) * 100;
    const pctLem = (lemak / targetLem) * 100;
    const pctKar = (karbo / targetKar) * 100;

    let verdict = 'Sesuai Target Gizi';
    let color = '#4ADE80'; // Green

    if (pctKal < 90 || pctProt < 90) {
      verdict = 'Kurang Memenuhi Standar';
      color = '#FB923C'; // Orange
    } else if (pctKal > 110 || pctProt > 110) {
      verdict = 'Gizi Berlebih';
      color = '#F87171'; // Red
    }

    let parts = [];

    // 1. Kalori
    if (pctKal < 90) {
      parts.push(`• Kecukupan Energi: Terpenuhi ${Math.round(pctKal)}% (${kalori} kkal dari target ${targetKal} kkal). Kandungan energi masih kurang. Pertimbangkan menambah porsi bahan pokok (Karbohidrat) seperti Nasi, Kentang, atau Jagung.`);
    } else if (pctKal > 110) {
      parts.push(`• Kecukupan Energi: Terpenuhi ${Math.round(pctKal)}% (${kalori} kkal dari target ${targetKal} kkal). Kandungan energi melebihi batas anjuran BGN (maksimal 110%). Sebaiknya kurangi porsi karbohidrat atau batasi penggunaan minyak/mentega.`);
    } else {
      parts.push(`• Kecukupan Energi: Terpenuhi ${Math.round(pctKal)}% (${kalori} kkal dari target ${targetKal} kkal). Kandungan kalori sudah ideal dan aman sesuai regulasi BGN.`);
    }

    // 2. Protein
    if (pctProt < 90) {
      parts.push(`• Kecukupan Protein: Terpenuhi ${Math.round(pctProt)}% (${protein}g dari target ${targetProt}g). Protein masih di bawah standar minimal BGN (90%). Sangat disarankan menambah porsi lauk hewani (misal: ayam, ikan segar, telur) atau lauk nabati (tempe/tahu murni).`);
    } else if (pctProt > 110) {
      parts.push(`• Kecukupan Protein: Terpenuhi ${Math.round(pctProt)}% (${protein}g dari target ${targetProt}g). Asupan protein melebihi batas anjuran BGN (maksimal 110%). Sebaiknya sesuaikan porsi protein.`);
    } else {
      parts.push(`• Kecukupan Protein: Terpenuhi ${Math.round(pctProt)}% (${protein}g dari target ${targetProt}g). Asupan protein sudah sangat mencukupi standar pertumbuhan anak sekolah.`);
    }

    // 3. Piring Makanku BGN Check
    const allNames = calculatorRows.map(r => r.nama.toLowerCase()).join(' ');
    const hasCarb = allNames.match(/(nasi|kentang|singkong|jagung|ubi|roti|mie|talas|sagu)/i);
    const hasAnimalProt = allNames.match(/(ayam|daging|sapi|kambing|telur|ikan|udang|cumi|kepiting|susu|lele|patin|nila|gurame|tongkol)/i);
    const hasPlantProt = allNames.match(/(tempe|tahu|kacang|kedelai|arcis|polong|kecipir|miso)/i);
    const hasVeggieOrFruit = allNames.match(/(bayam|wortel|kangkung|sawi|tomat|buncis|labu|timun|kol|brokoli|pisang|pepaya|jeruk|apel|mangga|semangka|melon)/i);

    let bgnMissing = [];
    if (!hasCarb) bgnMissing.push('Karbohidrat');
    if (!hasAnimalProt) bgnMissing.push('Lauk Hewani');
    if (!hasPlantProt) bgnMissing.push('Lauk Nabati');
    if (!hasVeggieOrFruit) bgnMissing.push('Sayur/Buah');

    if (bgnMissing.length > 0) {
      parts.push(`• Kelengkapan Piring MBG: Menu belum seimbang. Masih kekurangan unsur ${bgnMissing.join(', ')} sesuai regulasi kombinasi piring gizi BGN.`);
    } else {
      parts.push(`• Kelengkapan Piring MBG: Piring Makanku Lengkap! Semua unsur wajib (Karbohidrat + Lauk Hewani + Lauk Nabati + Sayur/Buah) terdeteksi dalam kalkulator.`);
    }

    // 4. Yield Factor (Susut)
    const hasFreshMeatOrVeg = allNames.match(/(bayam|kangkung|ayam|daging|ikan|lele|patin|nila|sapi)/i);
    if (hasFreshMeatOrVeg) {
      parts.push(`• Yield Factor (Penyusutan Masak): Ingat, berat bahan segar yang diinput adalah berat kotor mentah. Pada saat disiangi/dimasak, terjadi penyusutan berat siap konsumsi sekitar 20-35% (khususnya bayam, kangkung, dan daging/ikan). Pastikan belanja logistik dilebihkan sesuai faktor susut.`);
    }

    // 5. Alergen Check
    let allergensFound = [];
    if (allNames.includes('telur')) allergensFound.push('Telur');
    if (allNames.match(/(ikan|patin|lele|nila|gurame|tongkol|bandeng)/i)) allergensFound.push('Ikan');
    if (allNames.match(/(udang|cumi|kepiting|lobster|seafood)/i)) allergensFound.push('Seafood');
    if (allNames.includes('susu')) allergensFound.push('Susu Sapi');

    if (allergensFound.length > 0) {
      parts.push(`• Sensitivitas Alergi: Menu ini mengandung bahan berisiko alergi tinggi (${allergensFound.join(', ')}). Ahli Gizi menyarankan katering menyiapkan alternatif protein pengganti setara gizi (seperti ayam fillet atau tahu/tempe ekstra) untuk siswa yang alergi.`);
    }

    // 6. Keamanan Pangan
    parts.push(`• Batas Waktu Konsumsi: Hidangan olahan segar ini wajib dikonsumsi maksimal 3 jam setelah proses pemorsian katering selesai untuk menghindari risiko pembusukan.`);

    return {
      verdict,
      color,
      narrative: parts.join('\n\n')
    };
  };

  const renderTab4 = () => {
    let totKal = 0, totProt = 0, totKar = 0, totLem = 0, totSer = 0;
    calculatorRows.forEach(row => {
      totKal += row.kalori || 0;
      totProt += row.protein || 0;
      totKar += row.karbo || 0;
      totLem += row.lemak || 0;
      totSer += row.serat || 0;
    });
    
    const totals = {
      kalori: totKal,
      protein: parseFloat(totProt.toFixed(1)),
      karbo: parseFloat(totKar.toFixed(1)),
      lemak: parseFloat(totLem.toFixed(1)),
      serat: parseFloat(totSer.toFixed(1))
    };

    const targetAkg = AKG_DATA[calcTargetUsia] || AKG_DATA['sd_besar'];
    const narrativeResult = generateNutritionNarrative(totals, targetAkg);

    // Compute checklist variables for visualization diagram
    const targetKal = targetAkg.kal || targetAkg.kalori || 600;
    const targetProt = targetAkg.protein || 15;
    const pctKal = (totals.kalori / targetKal) * 100;
    const pctProt = (totals.protein / targetProt) * 100;

    const allNames = calculatorRows.map(r => r.nama.toLowerCase()).join(' ');
    const hasCarb = allNames.match(/(nasi|kentang|singkong|jagung|ubi|roti|mie|talas|sagu)/i);
    const hasAnimalProt = allNames.match(/(ayam|daging|sapi|kambing|telur|ikan|udang|cumi|kepiting|susu|lele|patin|nila|gurame|tongkol)/i);
    const hasPlantProt = allNames.match(/(tempe|tahu|kacang|kedelai|arcis|polong|kecipir|miso)/i);
    const hasVeggieOrFruit = allNames.match(/(bayam|wortel|kangkung|sawi|tomat|buncis|labu|timun|kol|brokoli|pisang|pepaya|jeruk|apel|mangga|semangka|melon)/i);

    return (
      <ScrollView style={styles.tabContent}>
        {/* Header Kalkulasi Harian */}
        <Text style={styles.gizseeTitle}>Kalkulasi Harian</Text>
        <Text style={styles.gizseeSubtitle}>Hitung Kandungan Gizi</Text>

        {/* Target Selector */}
        <View style={styles.card}>
          <Text style={styles.label}>🎯 Target Pemenuhan Gizi Acuan:</Text>
          <View style={styles.pickerWrapper}>
            {Object.keys(AKG_DATA).map((key) => (
              <TouchableOpacity
                key={key}
                style={[styles.pickerBtn, calcTargetUsia === key && styles.pickerBtnActive]}
                onPress={() => setCalcTargetUsia(key)}
              >
                <Text style={[styles.pickerBtnText, calcTargetUsia === key && styles.pickerBtnTextActive]}>
                  {AKG_DATA[key].name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Asisten AI Cerdas Card */}
        <View style={[styles.card, styles.aiCard]}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#C084FC" style={{ marginRight: 6 }} />
            <Text style={styles.aiCardTitle}>Asisten Resep Cerdas</Text>
          </View>
          
          <Text style={styles.aiCardDesc}>
            Mencari takaran resep campuran atau menu viral (seperti sawi gulung isi tahu). 
            Ketik nama menu & berat total di bawah ini!
          </Text>
          
          <View style={styles.aiInputRow}>
            <TextInput
              style={styles.aiTextInput}
              placeholder="Contoh: Sawi gulung isi tahu : 54g"
              placeholderTextColor="#626C90"
              value={aiInputText}
              onChangeText={setAiInputText}
            />
            <TouchableOpacity 
              style={[styles.aiSubmitBtn, isAiLoading && styles.aiSubmitBtnDisabled]} 
              onPress={() => handleAIParseInput(aiInputText)}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.aiSubmitBtnText}>Tanya AI</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Response Preview */}
          {aiExplanation ? (
            <View style={styles.aiResponseWrapper}>
              <View style={styles.aiChatBubble}>
                <Text style={styles.aiChatBubbleText}>🤖 {aiExplanation}</Text>
              </View>
              
              <Text style={styles.aiPreviewLabel}>📊 Pembagian Bahan oleh AI:</Text>
              {aiIngredients.map((item, idx) => (
                <View key={item.id || idx} style={styles.aiIngredientItem}>
                  <Text style={styles.aiIngredientText}>
                    {getFoodIcon(item.icon)} {item.nama}
                  </Text>
                  <Text style={styles.aiIngredientWeight}>
                    {item.berat} gram
                  </Text>
                </View>
              ))}

              <TouchableOpacity style={styles.aiApplyBtn} onPress={handleApplyAiIngredients}>
                <MaterialCommunityIcons name="playlist-plus" size={18} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.aiApplyBtnText}>Masukkan ke Tabel Kalkulator</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* List of Ingredients */}
        <Text style={styles.sectionTitle}>🥗 Bahan Makanan Kalkulator</Text>
        <View style={styles.card}>
          {calculatorRows.map((row, idx) => (
            <View key={row.id || idx} style={{ marginBottom: 12 }}>
              <View style={styles.calcRow}>
                {/* Nama Bahan Button */}
                <TouchableOpacity
                  style={styles.calcInputNamaBtn}
                  onPress={() => {
                    setTkpiModalMode('calculator');
                    setActiveRowIndexForSearch(idx);
                    setShowTkpiModal(true);
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{row.nama ? getFoodIcon(row.icon) : '🔍'}</Text>
                  <Text style={row.nama ? styles.calcInputNamaBtnText : styles.calcInputNamaPlaceholder} numberOfLines={1}>
                    {row.nama || 'Pilih Bahan Makanan...'}
                  </Text>
                </TouchableOpacity>

                {/* Berat Input */}
                <TextInput
                  style={styles.calcInputBerat}
                  placeholder="Gram"
                  placeholderTextColor="#626C90"
                  keyboardType="numeric"
                  value={row.berat}
                  onChangeText={(val) => handleUpdateCalculatorRowWeight(idx, val)}
                />

                {/* Delete Row Button */}
                <TouchableOpacity
                  style={styles.calcTrashBtn}
                  onPress={() => handleDeleteCalculatorRow(idx)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F87171" />
                </TouchableOpacity>
              </View>

              {/* Detail Nilai Gizi Per Item */}
              {row.nama !== '' && (
                <View style={styles.calcRowNutritionDetail}>
                  <Text style={styles.calcRowNutritionText}>
                    ⚡ {Math.round(row.kalori || 0)} kkal  |  🍖 {parseFloat((row.protein || 0).toFixed(1))}g P  |  🍞 {parseFloat((row.karbo || 0).toFixed(1))}g K  |  🥑 {parseFloat((row.lemak || 0).toFixed(1))}g L
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Action Buttons Row */}
          <View style={styles.gizseeActionsRow}>
            <TouchableOpacity
              style={[styles.gizseeActionBtn, styles.gizseeActionBtnLeft]}
              onPress={handleSaveCalculator}
            >
              <MaterialCommunityIcons name="content-save-outline" size={18} color="#A5ACCC" />
              <Text style={styles.gizseeActionBtnLeftText}>Simpan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gizseeActionBtn, styles.gizseeActionBtnRight]}
              onPress={() => {
                setCalculatorRows([
                  ...calculatorRows,
                  { id: String(Date.now()), nama: '', berat: '', kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0, baseKalori: 0, baseProtein: 0, baseKarbo: 0, baseLemak: 0, baseSerat: 0, mbgStatus: 'aman', mbgNotes: '', icon: 'rice', kat: '' }
                ]);
              }}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
              <Text style={styles.gizseeActionBtnRightText}>Tambah Bahan</Text>
            </TouchableOpacity>
          </View>

          {totals.kalori > 0 && (
            <TouchableOpacity
              style={styles.scaleAkgBtn}
              onPress={handleScaleToTargetAkg}
            >
              <MaterialCommunityIcons name="calculator-variant" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.scaleAkgBtnText}>Auto-Sesuaikan Porsi ke Target AKG</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hasil Perhitungan Card */}
        <View style={styles.gizseeHasilCard}>
          <Text style={styles.gizseeHasilTitle}>📊 Hasil Kalkulasi Gizi</Text>
          
          <View style={styles.gizseeHasilGrid}>
            <View style={styles.gizseeHasilCol}>
              <View style={styles.gizseeHasilRow}>
                <Text style={styles.gizseeHasilLabel}>⚡ Energi :</Text>
                <Text style={styles.gizseeHasilVal}>{totals.kalori} kkal</Text>
              </View>
              <View style={styles.gizseeHasilRow}>
                <Text style={styles.gizseeHasilLabel}>🍖 Protein :</Text>
                <Text style={styles.gizseeHasilVal}>{totals.protein} g</Text>
              </View>
            </View>
            
            <View style={styles.gizseeHasilCol}>
              <View style={styles.gizseeHasilRow}>
                <Text style={styles.gizseeHasilLabel}>🥑 Lemak :</Text>
                <Text style={styles.gizseeHasilVal}>{totals.lemak} g</Text>
              </View>
              <View style={styles.gizseeHasilRow}>
                <Text style={styles.gizseeHasilLabel}>🍞 Karbohidrat :</Text>
                <Text style={styles.gizseeHasilVal}>{totals.karbo} g</Text>
              </View>
            </View>
          </View>

          {totals.kalori > 0 && (
            <TouchableOpacity
              style={styles.gizseeExportBtn}
              onPress={handleExportToMenu}
            >
              <MaterialCommunityIcons name="export-variant" size={18} color="#FFF" />
              <Text style={styles.gizseeExportBtnText}>Ekspor Hasil Kalkulasi ke Menu</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Kebutuhan Belanja Dapur Card */}
        {totals.kalori > 0 && (
          <View style={styles.kitchenLogisticsCard}>
            <Text style={styles.gizseeHasilTitle}>👥 Kebutuhan Belanja Dapur ({jmlSiswa} Siswa)</Text>
            <Text style={styles.kitchenDescText}>
              Dihitung otomatis dengan standardisasi porsi susut (Yield Factor) Kemenkes agar porsi bersih di piring anak tetap terpenuhi.
            </Text>
            
            <View style={styles.kitchenLogisticsList}>
              {calculatorRows.filter(r => r.nama && parseFloat(r.berat) > 0).map((row, idx) => {
                const porsiMatang = parseFloat(row.berat) || 0;
                const totalPorsiMatangKg = (porsiMatang * siswaNum) / 1000;
                
                // Yield / Susut Factor calculation
                let yieldFactor = 1.0;
                let yieldNotes = '100% (Tanpa susut)';
                const nameLower = row.nama.toLowerCase();
                
                if (nameLower.includes('ayam') || nameLower.includes('daging') || nameLower.includes('sapi') || nameLower.includes('ikan') || nameLower.includes('bebek')) {
                  yieldFactor = 0.75; // Ayam/daging susut 25% saat dimasak
                  yieldNotes = '75% (Susut masak 25%)';
                } else if (nameLower.includes('sawi') || nameLower.includes('bayam') || nameLower.includes('kangkung') || nameLower.includes('sayur') || nameLower.includes('daun')) {
                  yieldFactor = 0.70; // Sayur disiangi & layu susut 30%
                  yieldNotes = '70% (Susut layu/siang 30%)';
                } else if (nameLower.includes('tempe') || nameLower.includes('tahu')) {
                  yieldFactor = 0.95; // Tahu/tempe susut 5%
                  yieldNotes = '95% (Susut goreng 5%)';
                }
                
                const totalMentahKg = totalPorsiMatangKg / yieldFactor;
                
                return (
                  <View key={row.id || idx} style={styles.kitchenLogisticsItem}>
                    <View style={styles.kitchenItemHeader}>
                      <Text style={styles.kitchenItemName}>
                        {getFoodIcon(row.icon)} {row.nama}
                      </Text>
                      <Text style={styles.kitchenItemYield}>{yieldNotes}</Text>
                    </View>
                    <View style={styles.kitchenItemGrid}>
                      <View style={styles.kitchenItemCol}>
                        <Text style={styles.kitchenItemLabel}>Porsi Bersih (Matang):</Text>
                        <Text style={styles.kitchenItemVal}>{(totalPorsiMatangKg).toFixed(2)} kg</Text>
                      </View>
                      <View style={styles.kitchenItemCol}>
                        <Text style={styles.kitchenItemLabel}>Kebutuhan Belanja (Mentah):</Text>
                        <Text style={[styles.kitchenItemVal, { color: '#C084FC', fontWeight: 'bold' }]}>
                          {(totalMentahKg).toFixed(2)} kg
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Progress Bars & Narrative Card */}
        {totals.kalori > 0 && (
          <View>
            <View style={styles.gizseeReportCard}>
              <Text style={[styles.gizseeHasilTitle, { color: narrativeResult.color }]}>
                📢 STATUS: {narrativeResult.verdict.toUpperCase()}
              </Text>
              
              {/* Progress bars inside narrative card */}
              <View style={{ marginVertical: 12 }}>
                {/* Kalori */}
                <View style={styles.gbrRow}>
                  <Text style={styles.gbrLabel}>Energi</Text>
                  <View style={styles.gbrBarTrack}>
                    <View style={[styles.gbrBarFill, { width: `${Math.min(100, totals.kalori/targetAkg.kal*100)}%`, backgroundColor: '#FACC15' }]} />
                  </View>
                  <Text style={styles.gbrValue}>{Math.round(totals.kalori/targetAkg.kal*100)}%</Text>
                </View>
                
                {/* Protein */}
                <View style={styles.gbrRow}>
                  <Text style={styles.gbrLabel}>Protein</Text>
                  <View style={styles.gbrBarTrack}>
                    <View style={[styles.gbrBarFill, { width: `${Math.min(100, totals.protein/targetAkg.protein*100)}%`, backgroundColor: '#4ADE80' }]} />
                  </View>
                  <Text style={styles.gbrValue}>{Math.round(totals.protein/targetAkg.protein*100)}%</Text>
                </View>
                
                {/* Karbo */}
                <View style={styles.gbrRow}>
                  <Text style={styles.gbrLabel}>Karbohidrat</Text>
                  <View style={styles.gbrBarTrack}>
                    <View style={[styles.gbrBarFill, { width: `${Math.min(100, totals.karbo/targetAkg.karbo*100)}%`, backgroundColor: '#60A5FA' }]} />
                  </View>
                  <Text style={styles.gbrValue}>{Math.round(totals.karbo/targetAkg.karbo*100)}%</Text>
                </View>
                
                {/* Lemak */}
                <View style={styles.gbrRow}>
                  <Text style={styles.gbrLabel}>Lemak</Text>
                  <View style={styles.gbrBarTrack}>
                    <View style={[styles.gbrBarFill, { width: `${Math.min(100, totals.lemak/targetAkg.lemak*100)}%`, backgroundColor: '#FB923C' }]} />
                  </View>
                  <Text style={styles.gbrValue}>{Math.round(totals.lemak/targetAkg.lemak*100)}%</Text>
                </View>
              </View>
              
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 }} />
              
              <Text style={styles.label}>📝 Rekomendasi Ahli Gizi SPPG:</Text>
              <Text style={styles.gizseeNarrativeText}>{narrativeResult.narrative}</Text>
            </View>

            {/* Checklist Visualisasi Standar MBG */}
            <View style={styles.gizseeReportCard}>
              <Text style={styles.gizseeHasilTitle}>📋 Visualisasi Standar MBG (Piring Makanku)</Text>
              
              <View style={styles.checklistGrid}>
                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={hasCarb ? "check-circle" : "close-circle"} 
                    size={20} 
                    color={hasCarb ? "#4ADE80" : "#F87171"} 
                  />
                  <Text style={[styles.checklistText, { color: hasCarb ? '#FFF' : '#A5ACCC' }]}>
                    Bahan Pokok (Karbohidrat)
                  </Text>
                </View>

                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={hasAnimalProt ? "check-circle" : "close-circle"} 
                    size={20} 
                    color={hasAnimalProt ? "#4ADE80" : "#F87171"} 
                  />
                  <Text style={[styles.checklistText, { color: hasAnimalProt ? '#FFF' : '#A5ACCC' }]}>
                    Lauk Hewani (Prot. Hewani)
                  </Text>
                </View>

                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={hasPlantProt ? "check-circle" : "close-circle"} 
                    size={20} 
                    color={hasPlantProt ? "#4ADE80" : "#F87171"} 
                  />
                  <Text style={[styles.checklistText, { color: hasPlantProt ? '#FFF' : '#A5ACCC' }]}>
                    Lauk Nabati (Prot. Nabati)
                  </Text>
                </View>

                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={hasVeggieOrFruit ? "check-circle" : "close-circle"} 
                    size={20} 
                    color={hasVeggieOrFruit ? "#4ADE80" : "#F87171"} 
                  />
                  <Text style={[styles.checklistText, { color: hasVeggieOrFruit ? '#FFF' : '#A5ACCC' }]}>
                    Sayur & Buah-Buahan
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', width: '100%', marginVertical: 6 }} />

                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={pctKal >= 90 && pctKal <= 110 ? "check-circle" : "alert-circle"} 
                    size={20} 
                    color={pctKal >= 90 && pctKal <= 110 ? "#4ADE80" : "#FB923C"} 
                  />
                  <Text style={[styles.checklistText, { color: pctKal >= 90 && pctKal <= 110 ? '#FFF' : '#FB923C' }]}>
                    Kecukupan Energi: {Math.round(pctKal)}% ({pctKal < 90 ? 'Kurang' : (pctKal > 110 ? 'Berlebih' : 'Sesuai Target')})
                  </Text>
                </View>

                <View style={styles.checklistItem}>
                  <MaterialCommunityIcons 
                    name={pctProt >= 90 && pctProt <= 110 ? "check-circle" : "alert-circle"} 
                    size={20} 
                    color={pctProt >= 90 && pctProt <= 110 ? "#4ADE80" : "#FB923C"} 
                  />
                  <Text style={[styles.checklistText, { color: pctProt >= 90 && pctProt <= 110 ? '#FFF' : '#FB923C' }]}>
                    Kecukupan Protein: {Math.round(pctProt)}% ({pctProt < 90 ? 'Kurang' : (pctProt > 110 ? 'Berlebih' : 'Sesuai Target')})
                  </Text>
                </View>
              </View>

              {/* Rangkuman Detail Gizi & Legenda */}
              <View style={{ marginTop: 12, backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.04)' }}>
                <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '700', marginBottom: 4 }}>💡 Keterangan Indikator & Target MBG:</Text>
                <Text style={{ color: '#A5ACCC', fontSize: 11, lineHeight: 16 }}>
                  • <Text style={{ color: '#4ADE80', fontWeight: '700' }}>Hijau (Centang)</Text>: Nutrisi optimal sesuai standar BGN (Energi 90-110%, Protein 90-110%).{"\n"}
                  • <Text style={{ color: '#FB923C', fontWeight: '700' }}>Oranye (Tanda Seru)</Text>: Nutrisi <Text style={{ color: '#FB923C' }}>Kurang</Text> (&lt;90%) atau <Text style={{ color: '#FB923C' }}>Berlebih</Text> (&gt;110% Energi, &gt;110% Protein) sehingga porsi belanja/masak perlu disesuaikan.{"\n"}
                  • <Text style={{ color: '#F87171', fontWeight: '700' }}>Merah (Silang)</Text>: Komponen bahan wajib piring MBG belum terdeteksi dalam daftar masakan.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Riwayat Perhitungan */}
        <Text style={styles.riwayatTitle}>🕒 Riwayat Perhitungan Gizi</Text>
        {calculatorHistory.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 20 }]}>
            <MaterialCommunityIcons name="history" size={24} color="#626C90" />
            <Text style={[styles.hintText, { marginTop: 6, marginBottom: 0 }]}>Belum ada riwayat perhitungan gizi yang disimpan.</Text>
          </View>
        ) : (
          calculatorHistory.map((item) => (
            <View key={item.id} style={styles.riwayatCard}>
              <View style={styles.riwayatHeader}>
                <Text style={styles.riwayatTime}>🕒 Saved: {item.timestamp}</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteHistoryItem(item.id)}
                  style={{ padding: 2 }}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* List ingredients in history item */}
              <Text style={{ color: '#E2E8F0', fontSize: 12, fontWeight: '600' }}>
                {item.rows.map(r => `${getFoodIcon(r.icon)} ${r.nama} (${r.berat}g)`).join(', ')}
              </Text>

              {/* Nutrients badges */}
              <View style={styles.riwayatGiziRow}>
                <View style={styles.riwayatGiziBadge}>
                  <Text style={styles.riwayatGiziText}>⚡ {item.totals.kalori} kkal</Text>
                </View>
                <View style={[styles.riwayatGiziBadge, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
                  <Text style={[styles.riwayatGiziText, { color: '#4ADE80' }]}>🍖 {item.totals.protein}g</Text>
                </View>
                <View style={[styles.riwayatGiziBadge, { backgroundColor: 'rgba(96, 165, 250, 0.1)' }]}>
                  <Text style={[styles.riwayatGiziText, { color: '#60A5FA' }]}>🍞 {item.totals.karbo}g</Text>
                </View>
                <View style={[styles.riwayatGiziBadge, { backgroundColor: 'rgba(251, 146, 60, 0.1)' }]}>
                  <Text style={[styles.riwayatGiziText, { color: '#FB923C' }]}>🥑 {item.totals.lemak}g</Text>
                </View>
              </View>

              {/* Riwayat Actions */}
              <View style={styles.riwayatBtnRow}>
                <TouchableOpacity
                  style={styles.riwayatBtn}
                  onPress={() => handleLoadHistoryToCalculator(item)}
                >
                  <MaterialCommunityIcons name="restore" size={14} color="#60A5FA" />
                  <Text style={[styles.riwayatBtnText, { color: '#60A5FA' }]}>Muat ke Kalkulator</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };



  const getRecipeIngredientsListStr = (itemId) => {
    const r = recipeDetails[itemId] || customRecipeDetails[itemId];
    if (!r) return '';
    const list = [];
    if (r.utama) list.push(r.utama.nama);
    if (r.pelengkap) {
      r.pelengkap.forEach(p => list.push(p.nama));
    }
    return list.join(', ');
  };

  const openRecipeEditorModal = (item, category) => {
    const itemWithKat = { ...item, kat: item.kat || category };
    setEditingItem(itemWithKat);
    
    // Find current recipe
    const recipe = recipeDetails[item.id] || customRecipeDetails[item.id] || {
      utama: { nama: item.nama.replace(/^[^\w]*/, '').trim(), qty: 100, unit: 'g', catatan: 'Bahan utama' },
      pelengkap: []
    };
    
    setEditRecipeUtama({
      nama: recipe.utama ? recipe.utama.nama : item.nama.replace(/^[^\w]*/, '').trim(),
      qty: recipe.utama ? String(recipe.utama.qty) : '100',
      unit: recipe.utama ? recipe.utama.unit : 'g',
      catatan: recipe.utama ? recipe.utama.catatan : ''
    });
    
    setEditRecipePelengkap(recipe.pelengkap ? recipe.pelengkap.map(p => ({
      nama: p.nama,
      qty: String(p.qty),
      unit: p.unit,
      catatan: p.catatan || ''
    })) : []);
    
    // Pre-populate prices for all ingredients in the recipe
    const prices = {};
    const addPrice = (name) => {
      const pInfo = ingredientPrices[name] || DEFAULT_INGREDIENT_PRICES[name] || { price: 0, unit: 'kg' };
      prices[name] = { price: String(pInfo.price), unit: pInfo.unit };
    };
    
    if (recipe.utama) addPrice(recipe.utama.nama);
    if (recipe.pelengkap) {
      recipe.pelengkap.forEach(p => addPrice(p.nama));
    }
    
    setEditIngredientPrices(prices);
  };

  const handleSaveRecipeEditor = () => {
    if (!editingItem) return;
    
    // Parse quantities as numbers
    const parsedUtama = {
      nama: editRecipeUtama.nama,
      qty: parseFloat(editRecipeUtama.qty) || 0,
      unit: editRecipeUtama.unit,
      catatan: editRecipeUtama.catatan
    };
    
    const parsedPelengkap = editRecipePelengkap.map(p => ({
      nama: p.nama,
      qty: parseFloat(p.qty) || 0,
      unit: p.unit,
      catatan: p.catatan
    }));
    
    // Save to recipeDetails state
    setRecipeDetails(prev => ({
      ...prev,
      [editingItem.id]: {
        utama: parsedUtama,
        pelengkap: parsedPelengkap,
        pelengkapType: (recipeDetails[editingItem.id] || {}).pelengkapType || 'CUSTOM'
      }
    }));
    
    // Parse and save ingredient prices
    const newPrices = { ...ingredientPrices };
    Object.keys(editIngredientPrices).forEach(name => {
      newPrices[name] = {
        price: parseFloat(editIngredientPrices[name].price) || 0,
        unit: editIngredientPrices[name].unit
      };
    });
    setIngredientPrices(newPrices);

    // Calculate new price based on updated ingredients and prices
    const getCalculatedPrice = () => {
      let cost = 0;
      if (parsedUtama.nama.trim() !== '') {
        const getPrice = (name) => {
          if (editIngredientPrices[name]) {
            return parseFloat(editIngredientPrices[name].price) || 0;
          }
          const info = ingredientPrices[name] || DEFAULT_INGREDIENT_PRICES[name];
          return info ? info.price : 0;
        };
        const getPriceUnit = (name) => {
          if (editIngredientPrices[name]) {
            return editIngredientPrices[name].unit;
          }
          const info = ingredientPrices[name] || DEFAULT_INGREDIENT_PRICES[name];
          return info ? info.unit : 'kg';
        };

        const getSingleCost = (name, qty, unit) => {
          const price = getPrice(name);
          const priceUnit = getPriceUnit(name);
          return calculateIngredientCost(name, qty, unit, price, priceUnit);
        };

        cost += getSingleCost(parsedUtama.nama, parsedUtama.qty, parsedUtama.unit);
        parsedPelengkap.forEach(p => {
          if (p.nama.trim() !== '') {
            cost += getSingleCost(p.nama, p.qty, p.unit);
          }
        });
      }
      return Math.round(cost);
    };

    const newPrice = getCalculatedPrice();
    setMenuPrices(prev => ({
      ...prev,
      [editingItem.id]: newPrice
    }));
    
    setEditingItem(null);
    Alert.alert('Sukses', `Resep dan harga bahan untuk ${editingItem.nama} berhasil diperbarui!`);
  };

  const renderRecipeEditorModal = () => {
    if (!editingItem) return null;
    
    // Calculate preview portion price
    let previewPrice = 0;
    
    const getPreviewIngCost = (name, qtyStr, unitStr) => {
      const qty = parseFloat(qtyStr) || 0;
      const pInfo = editIngredientPrices[name] || { price: '0', unit: 'kg' };
      const price = parseFloat(pInfo.price) || 0;
      const priceUnit = pInfo.unit;
      
      return calculateIngredientCost(name, qty, unitStr, price, priceUnit);
    };
    
    previewPrice += getPreviewIngCost(editRecipeUtama.nama, editRecipeUtama.qty, editRecipeUtama.unit);
    editRecipePelengkap.forEach(p => {
      previewPrice += getPreviewIngCost(p.nama, p.qty, p.unit);
    });
    
    const isCookedCategory = editingItem.kat !== 'buah';
    const previewBumbu = isCookedCategory ? 500 : 0;
    const finalPreview = Math.round(previewPrice) + previewBumbu;

    return (
      <Modal
        visible={!!editingItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Edit Resep &amp; Harga</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setEditingItem(null)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#A5ACCC" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 2 }}>{editingItem.nama}</Text>
              <Text style={{ color: '#626C90', fontSize: 11, marginBottom: 15 }}>Kategori: {editingItem.kat.toUpperCase()}</Text>
              
              {/* BAHAN UTAMA SECTION */}
              <Text style={[styles.sectionTitle, { marginTop: 0 }]}>🥩 BAHAN UTAMA</Text>
              <View style={styles.card}>
                <Text style={styles.label}>Nama Bahan Utama</Text>
                <TextInput
                  style={styles.input}
                  value={editRecipeUtama.nama}
                  onChangeText={(val) => {
                    const oldName = editRecipeUtama.nama;
                    setEditRecipeUtama(prev => ({ ...prev, nama: val }));
                    // Migrate price key
                    setEditIngredientPrices(prev => {
                      const copy = { ...prev };
                      if (copy[oldName]) {
                        copy[val] = copy[oldName];
                        delete copy[oldName];
                      } else {
                        copy[val] = { price: '0', unit: 'kg' };
                      }
                      return copy;
                    });
                  }}
                  placeholder="Nama bahan utama"
                  placeholderTextColor="#626C90"
                />
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.label}>Takaran (gram/butir)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editRecipeUtama.qty}
                      onChangeText={(val) => setEditRecipeUtama(prev => ({ ...prev, qty: val }))}
                      placeholder="100"
                      placeholderTextColor="#626C90"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Satuan</Text>
                    <TextInput
                      style={styles.input}
                      value={editRecipeUtama.unit}
                      onChangeText={(val) => setEditRecipeUtama(prev => ({ ...prev, unit: val }))}
                      placeholder="g"
                      placeholderTextColor="#626C90"
                    />
                  </View>
                </View>

                {/* Price editor for this ingredient */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.label}>Harga Satuan Pasar (Rp)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={(editIngredientPrices[editRecipeUtama.nama] || { price: '0' }).price}
                      onChangeText={(val) => setEditIngredientPrices(prev => ({
                        ...prev,
                        [editRecipeUtama.nama]: { ...prev[editRecipeUtama.nama], price: val }
                      }))}
                      placeholder="60000"
                      placeholderTextColor="#626C90"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Per Satuan</Text>
                    <TextInput
                      style={styles.input}
                      value={(editIngredientPrices[editRecipeUtama.nama] || { unit: 'kg' }).unit}
                      onChangeText={(val) => setEditIngredientPrices(prev => ({
                        ...prev,
                        [editRecipeUtama.nama]: { ...prev[editRecipeUtama.nama], unit: val }
                      }))}
                      placeholder="kg"
                      placeholderTextColor="#626C90"
                    />
                  </View>
                </View>
              </View>

              {/* BAHAN PELENGKAP SECTION */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 10 }}>
                <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>🌾 BAHAN PELENGKAP / BUMBU</Text>
                <TouchableOpacity 
                  style={{ backgroundColor: 'rgba(96,165,250,0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}
                  onPress={() => {
                    setEditRecipePelengkap(prev => [...prev, { nama: 'Bahan Baru', qty: '10', unit: 'g', catatan: '' }]);
                    setEditIngredientPrices(prev => ({
                      ...prev,
                      'Bahan Baru': { price: '10000', unit: 'kg' }
                    }));
                  }}
                >
                  <Text style={{ color: '#60A5FA', fontSize: 10, fontWeight: '700' }}>+ Tambah</Text>
                </TouchableOpacity>
              </View>

              {editRecipePelengkap.map((p, idx) => (
                <View key={idx} style={[styles.card, { padding: 12, marginBottom: 10, borderColor: 'rgba(255,255,255,0.05)', borderWidth: 1 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#60A5FA', fontSize: 11, fontWeight: '700' }}>Bahan #{idx + 1}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const copy = [...editRecipePelengkap];
                        copy.splice(idx, 1);
                        setEditRecipePelengkap(copy);
                      }}
                    >
                      <MaterialCommunityIcons name="delete" size={16} color="#F87171" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.label}>Nama Bahan</Text>
                  <TextInput
                    style={[styles.input, { height: 35, fontSize: 12 }]}
                    value={p.nama}
                    onChangeText={(val) => {
                      const oldName = p.nama;
                      const copy = [...editRecipePelengkap];
                      copy[idx].nama = val;
                      setEditRecipePelengkap(copy);
                      // Migrate price key
                      setEditIngredientPrices(prev => {
                        const pricesCopy = { ...prev };
                        if (pricesCopy[oldName]) {
                          pricesCopy[val] = pricesCopy[oldName];
                          delete pricesCopy[oldName];
                        } else {
                          pricesCopy[val] = { price: '0', unit: 'kg' };
                        }
                        return pricesCopy;
                      });
                    }}
                    placeholder="Nama bahan"
                    placeholderTextColor="#626C90"
                  />
                  
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.label}>Takaran</Text>
                      <TextInput
                        style={[styles.input, { height: 35, fontSize: 12 }]}
                        keyboardType="numeric"
                        value={p.qty}
                        onChangeText={(val) => {
                          const copy = [...editRecipePelengkap];
                          copy[idx].qty = val;
                          setEditRecipePelengkap(copy);
                        }}
                        placeholder="10"
                        placeholderTextColor="#626C90"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Satuan</Text>
                      <TextInput
                        style={[styles.input, { height: 35, fontSize: 12 }]}
                        value={p.unit}
                        onChangeText={(val) => {
                          const copy = [...editRecipePelengkap];
                          copy[idx].unit = val;
                          setEditRecipePelengkap(copy);
                        }}
                        placeholder="g"
                        placeholderTextColor="#626C90"
                      />
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.label}>Harga Satuan (Rp)</Text>
                      <TextInput
                        style={[styles.input, { height: 35, fontSize: 12 }]}
                        keyboardType="numeric"
                        value={(editIngredientPrices[p.nama] || { price: '0' }).price}
                        onChangeText={(val) => setEditIngredientPrices(prev => ({
                          ...prev,
                          [p.nama]: { ...prev[p.nama], price: val }
                        }))}
                        placeholder="12000"
                        placeholderTextColor="#626C90"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Per Satuan</Text>
                      <TextInput
                        style={[styles.input, { height: 35, fontSize: 12 }]}
                        value={(editIngredientPrices[p.nama] || { unit: 'kg' }).unit}
                        onChangeText={(val) => setEditIngredientPrices(prev => ({
                          ...prev,
                          [p.nama]: { ...prev[p.nama], unit: val }
                        }))}
                        placeholder="kg"
                        placeholderTextColor="#626C90"
                      />
                    </View>
                  </View>
                </View>
              ))}

              {/* LIVE CALCULATED FOOD COST PREVIEW */}
              <View style={[styles.card, { backgroundColor: '#1E293B', borderColor: '#4ADE80', borderWidth: 1, marginTop: 15 }]}>
                <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Kalkulasi Biaya per Porsi (Preview)</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: '#FFF', fontSize: 12 }}>Bahan Utama ({editRecipeUtama.nama})</Text>
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>
                    Rp {Math.round(getPreviewIngCost(editRecipeUtama.nama, editRecipeUtama.qty, editRecipeUtama.unit)).toLocaleString('id')}
                  </Text>
                </View>
                
                {editRecipePelengkap.map((p, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Bahan Pelengkap: {p.nama}</Text>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>
                      Rp {Math.round(getPreviewIngCost(p.nama, p.qty, p.unit)).toLocaleString('id')}
                    </Text>
                  </View>
                ))}

                {isCookedCategory && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                    <Text style={{ color: '#A5ACCC', fontSize: 11 }}>Minyak &amp; Bumbu Dasar</Text>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>Rp 500</Text>
                  </View>
                )}

                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 }} />
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Total Cost per Porsi</Text>
                  <Text style={{ color: '#4ADE80', fontSize: 14, fontWeight: '800' }}>
                    Rp {finalPreview.toLocaleString('id')}
                  </Text>
                </View>
              </View>
              
              {/* LIVE CALCULATED GIZI PREVIEW */}
              {(() => {
                const getPreviewRecipeGizi = () => {
                  let gizi = { kalori: 0, protein: 0, karbo: 0, lemak: 0, serat: 0 };
                  
                  const addIngGizi = (name, qtyStr, unitStr) => {
                    const qty = parseFloat(qtyStr) || 0;
                    const itemG = getIngredientGizi(name, qty, unitStr);
                    gizi.kalori += itemG.kalori;
                    gizi.protein += itemG.protein;
                    gizi.karbo += itemG.karbo;
                    gizi.lemak += itemG.lemak;
                    gizi.serat += itemG.serat;
                  };

                  if (editRecipeUtama.nama.trim() !== '') {
                    addIngGizi(editRecipeUtama.nama, editRecipeUtama.qty, editRecipeUtama.unit);
                  }
                  editRecipePelengkap.forEach(p => {
                    if (p.nama.trim() !== '') {
                      addIngGizi(p.nama, p.qty, p.unit);
                    }
                  });

                  return {
                    kalori: Math.round(gizi.kalori),
                    protein: parseFloat(gizi.protein.toFixed(1)),
                    karbo: parseFloat(gizi.karbo.toFixed(1)),
                    lemak: parseFloat(gizi.lemak.toFixed(1)),
                    serat: parseFloat(gizi.serat.toFixed(1))
                  };
                };

                const previewGizi = getPreviewRecipeGizi();

                return (
                  <View style={[styles.card, { backgroundColor: '#1E293B', borderColor: '#60A5FA', borderWidth: 1, marginTop: 10 }]}>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>Kandungan Gizi per Porsi (Preview)</Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                      <Text style={{ color: '#FFF', fontSize: 12 }}>Energi (Kalori)</Text>
                      <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>{previewGizi.kalori} kkal</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: '#FFF', fontSize: 12 }}>Protein</Text>
                      <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>{previewGizi.protein} g</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: '#FFF', fontSize: 12 }}>Karbohidrat</Text>
                      <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>{previewGizi.karbo} g</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: '#FFF', fontSize: 12 }}>Lemak</Text>
                      <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>{previewGizi.lemak} g</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ color: '#FFF', fontSize: 12 }}>Serat</Text>
                      <Text style={{ color: '#60A5FA', fontSize: 12, fontWeight: '700' }}>{previewGizi.serat} g</Text>
                    </View>
                  </View>
                );
              })()}
              
              {/* SAVE BUTTONS */}
              <TouchableOpacity
                style={[styles.primaryButton, { marginVertical: 20 }]}
                onPress={handleSaveRecipeEditor}
              >
                <MaterialCommunityIcons name="content-save" size={18} color="#000" />
                <Text style={styles.primaryButtonText}>Simpan Resep &amp; Harga</Text>
              </TouchableOpacity>
              
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDeleteConfirmModal = () => {
    if (!deleteConfirmItem) return null;
    return (
      <Modal
        transparent
        animationType="fade"
        visible={!!deleteConfirmItem}
        onRequestClose={() => setDeleteConfirmItem(null)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(7, 9, 14, 0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#101422',
            borderRadius: 16,
            width: '100%',
            maxWidth: 340,
            padding: 22,
            borderColor: 'rgba(248, 113, 113, 0.3)',
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            elevation: 10
          }}>
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(248, 113, 113, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(248, 113, 113, 0.3)'
              }}>
                <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#F87171" />
              </View>
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>Hapus Menu?</Text>
              <Text style={{ color: '#8892B0', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 }}>
                Apakah Anda yakin ingin menghapus menu <Text style={{ color: '#FFF', fontWeight: 'bold' }}>"{deleteConfirmItem.nama}"</Text> dari daftar kategori?
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center'
                }}
                onPress={() => setDeleteConfirmItem(null)}
              >
                <Text style={{ color: '#A5ACCC', fontSize: 13, fontWeight: '700' }}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#EF4444',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center'
                }}
                onPress={() => {
                  const item = deleteConfirmItem;
                  setSelected(prev => {
                    const currentList = Array.isArray(prev[item.kat]) ? prev[item.kat] : (prev[item.kat] ? [prev[item.kat]] : []);
                    return {
                      ...prev,
                      [item.kat]: currentList.filter(x => x !== item.id)
                    };
                  });
                  
                  if (item.id.startsWith('custom-')) {
                    setCustomMenus(prev => prev.filter(x => x.id !== item.id));
                  } else {
                    setDeletedMenuIds(prev => [...prev, item.id]);
                  }
                  setDeleteConfirmItem(null);
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Ya, Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTkpiModal = () => {
    // Filter items based on tkpiSearchQuery
    const filteredTkpi = TKPI_DATABASE.filter(item => 
      item.nama.toLowerCase().includes(tkpiSearchQuery.toLowerCase()) ||
      item.kat.toLowerCase().includes(tkpiSearchQuery.toLowerCase())
    );

    // Calculate nutrients based on tkpiPortionInput
    const portionGrams = parseFloat(tkpiPortionInput) || 0;
    const factor = portionGrams / 100;

    const calcGizi = selectedTkpiItem ? {
      kalori: Math.round(selectedTkpiItem.kalori * factor),
      protein: parseFloat((selectedTkpiItem.protein * factor).toFixed(1)),
      karbo: parseFloat((selectedTkpiItem.karbo * factor).toFixed(1)),
      lemak: parseFloat((selectedTkpiItem.lemak * factor).toFixed(1)),
      serat: parseFloat((selectedTkpiItem.serat * factor).toFixed(1))
    } : null;

    const handleUseTkpiItem = () => {
      if (!selectedTkpiItem) return;
      
      if (tkpiModalMode === 'calculator') {
        const updatedRows = [...calculatorRows];
        if (activeRowIndexForSearch !== null && updatedRows[activeRowIndexForSearch]) {
          updatedRows[activeRowIndexForSearch] = {
            ...updatedRows[activeRowIndexForSearch],
            nama: selectedTkpiItem.nama,
            berat: String(portionGrams),
            kalori: calcGizi.kalori,
            protein: calcGizi.protein,
            karbo: calcGizi.karbo,
            lemak: calcGizi.lemak,
            serat: calcGizi.serat,
            baseKalori: selectedTkpiItem.kalori,
            baseProtein: selectedTkpiItem.protein,
            baseKarbo: selectedTkpiItem.karbo,
            baseLemak: selectedTkpiItem.lemak,
            baseSerat: selectedTkpiItem.serat,
            mbgStatus: selectedTkpiItem.mbgStatus,
            mbgNotes: selectedTkpiItem.mbgNotes,
            icon: selectedTkpiItem.icon,
            kat: selectedTkpiItem.kat
          };
          setCalculatorRows(updatedRows);
        }
      } else {
        setCustomIcon(selectedTkpiItem.icon);
        setCustomNama(`${selectedTkpiItem.nama} (${portionGrams}g)`);
        setCustomKat(selectedTkpiItem.kat);
        setCustomKalori(String(calcGizi.kalori));
        setCustomProtein(String(calcGizi.protein));
        setCustomKarbo(String(calcGizi.karbo));
        setCustomLemak(String(calcGizi.lemak));
        setCustomSerat(String(calcGizi.serat));
        setCustomMbgStatus(selectedTkpiItem.mbgStatus);
        setCustomMbgNotes(selectedTkpiItem.mbgNotes);
      }
      
      // Close modal
      setShowTkpiModal(false);
      setSelectedTkpiItem(null);
      setTkpiSearchQuery('');
    };

    return (
      <Modal
        visible={showTkpiModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTkpiModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔍 Kamus Gizi & Regulasi MBG</Text>
              <TouchableOpacity onPress={() => setShowTkpiModal(false)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={24} color="#A5ACCC" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.modalSearchWrapper}>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Cari bahan (e.g. lele, ayam, wortel, susu)..."
                placeholderTextColor="#626C90"
                value={tkpiSearchQuery}
                onChangeText={setTkpiSearchQuery}
              />
              {tkpiSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setTkpiSearchQuery('')} style={styles.modalClearBtn}>
                  <MaterialCommunityIcons name="close-circle" size={16} color="#626C90" />
                </TouchableOpacity>
              )}
            </View>

            {/* List Bahan / Preview Portion */}
            {!selectedTkpiItem ? (
              <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
                {filteredTkpi.length === 0 ? (
                  <Text style={styles.modalEmptyText}>Bahan makanan tidak ditemukan. Coba keyword lain!</Text>
                ) : (
                  filteredTkpi.map((item, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.tkpiRowCard}
                      onPress={() => {
                        setSelectedTkpiItem(item);
                        setTkpiPortionInput('100'); // reset portion to 100g
                      }}
                    >
                      <Text style={styles.tkpiIcon}>{getFoodIcon(item.icon)}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.tkpiNameText}>{item.nama}</Text>
                        <Text style={styles.tkpiNutrientDesc}>
                          {item.kalori} kkal · P:{item.protein}g · K:{item.karbo}g · L:{item.lemak}g per 100g
                        </Text>
                      </View>
                      
                      {/* Badge status */}
                      <View style={[
                        styles.statusBadgeSmall,
                        item.mbgStatus === 'aman' ? styles.badgeAman :
                        item.mbgStatus === 'dibatasi' ? styles.badgeDibatasi : styles.badgeDilarang
                      ]}>
                        <Text style={[
                          styles.statusBadgeTextSmall,
                          item.mbgStatus === 'aman' ? styles.textAman :
                          item.mbgStatus === 'dibatasi' ? styles.textDibatasi : styles.textDilarang
                        ]}>
                          {item.mbgStatus === 'aman' ? 'AMAN' :
                           item.mbgStatus === 'dibatasi' ? 'DIBATASI' : 'DILARANG'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            ) : (
              /* Portions config pane */
              <View style={styles.portionPane}>
                <TouchableOpacity 
                  style={styles.backBtn}
                  onPress={() => setSelectedTkpiItem(null)}
                >
                  <Text style={styles.backBtnText}>← Kembali ke Pencarian</Text>
                </TouchableOpacity>

                {/* Selected Item Info Card */}
                <View style={styles.selectedHeaderCard}>
                  <Text style={styles.selectedIcon}>{getFoodIcon(selectedTkpiItem.icon)}</Text>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.selectedName}>{selectedTkpiItem.nama}</Text>
                    <Text style={styles.selectedCategory}>Kategori: {selectedTkpiItem.kat.toUpperCase()}</Text>
                  </View>
                  <View style={[
                    styles.statusBadgeSmall,
                    selectedTkpiItem.mbgStatus === 'aman' ? styles.badgeAman :
                    selectedTkpiItem.mbgStatus === 'dibatasi' ? styles.badgeDibatasi : styles.badgeDilarang
                  ]}>
                    <Text style={[
                      styles.statusBadgeTextSmall,
                      selectedTkpiItem.mbgStatus === 'aman' ? styles.textAman :
                      selectedTkpiItem.mbgStatus === 'dibatasi' ? styles.textDibatasi : styles.textDilarang
                    ]}>
                      {selectedTkpiItem.mbgStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Compliance Notes Alert */}
                <View style={[
                  styles.complianceNoteBox,
                  selectedTkpiItem.mbgStatus === 'aman' ? styles.noteBoxGreen :
                  selectedTkpiItem.mbgStatus === 'dibatasi' ? styles.noteBoxYellow : styles.noteBoxRed
                ]}>
                  <MaterialCommunityIcons 
                    name={selectedTkpiItem.mbgStatus === 'aman' ? 'check-circle' : selectedTkpiItem.mbgStatus === 'dibatasi' ? 'alert' : 'close-circle'} 
                    size={18} 
                    color={selectedTkpiItem.mbgStatus === 'aman' ? '#4ADE80' : selectedTkpiItem.mbgStatus === 'dibatasi' ? '#FACC15' : '#F87171'} 
                  />
                  <Text style={[
                    styles.complianceNoteText,
                    selectedTkpiItem.mbgStatus === 'aman' ? styles.textAman :
                    selectedTkpiItem.mbgStatus === 'dibatasi' ? styles.textDibatasi : styles.textDilarang
                  ]}>
                    {selectedTkpiItem.mbgNotes}
                  </Text>
                </View>

                {/* Portion Input */}
                <Text style={styles.paneLabel}>Tentukan Takaran Porsi per Anak (gram)</Text>
                <View style={styles.portionInputRow}>
                  <TextInput
                    style={styles.portionTextInput}
                    keyboardType="numeric"
                    value={tkpiPortionInput}
                    onChangeText={setTkpiPortionInput}
                    placeholder="100"
                    placeholderTextColor="#626C90"
                  />
                  <Text style={styles.portionUnitLabel}>gram</Text>
                </View>

                {/* Live Preview Portioned Nutrients */}
                <Text style={styles.paneLabel}>Nutrisi Terhitung (Proporsional):</Text>
                <View style={styles.nutrientsPreviewCard}>
                  <View style={styles.nutrItem}>
                    <Text style={styles.nutrVal}>{calcGizi.kalori}</Text>
                    <Text style={styles.nutrLbl}>Kalori (kkal)</Text>
                  </View>
                  <View style={styles.nutrItem}>
                    <Text style={styles.nutrVal}>{calcGizi.protein}g</Text>
                    <Text style={styles.nutrLbl}>Protein</Text>
                  </View>
                  <View style={styles.nutrItem}>
                    <Text style={styles.nutrVal}>{calcGizi.karbo}g</Text>
                    <Text style={styles.nutrLbl}>Karbo</Text>
                  </View>
                  <View style={styles.nutrItem}>
                    <Text style={styles.nutrVal}>{calcGizi.lemak}g</Text>
                    <Text style={styles.nutrLbl}>Lemak</Text>
                  </View>
                  <View style={styles.nutrItem}>
                    <Text style={styles.nutrVal}>{calcGizi.serat}g</Text>
                    <Text style={styles.nutrLbl}>Serat</Text>
                  </View>
                </View>

                {/* Use Button */}
                <TouchableOpacity 
                  style={[
                    styles.useBtn,
                    selectedTkpiItem.mbgStatus === 'dilarang' && { backgroundColor: '#F87171' }
                  ]}
                  onPress={handleUseTkpiItem}
                >
                  <Text style={[styles.useBtnText, selectedTkpiItem.mbgStatus === 'dilarang' && { color: '#FFF' }]}>
                    {selectedTkpiItem.mbgStatus === 'dilarang' ? 'Tetap Gunakan (Melanggar Regulasi)' : 'Impor ke Form Custom'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SPPG Perencana Menu MBG</Text>
        <Text style={styles.headerSubtitle}>SD &amp; SMP Nutrition &amp; Budget Planner</Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 1 && styles.tabButtonActive]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabButtonText, activeTab === 1 && styles.tabButtonTextActive]}>Setup</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 2 && styles.tabButtonActive]}
          onPress={() => setActiveTab(2)}
        >
          <Text style={[styles.tabButtonText, activeTab === 2 && styles.tabButtonTextActive]}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 3 && styles.tabButtonActive]}
          onPress={() => setActiveTab(3)}
        >
          <Text style={[styles.tabButtonText, activeTab === 3 && styles.tabButtonTextActive]}>Hasil</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 4 && styles.tabButtonActive]}
          onPress={() => setActiveTab(4)}
        >
          <Text style={[styles.tabButtonText, activeTab === 4 && styles.tabButtonTextActive]}>Kalkulasi Harian</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Pages */}
      {activeTab === 1 && renderTab1()}
      {activeTab === 2 && renderTab2()}
      {activeTab === 3 && renderTab3()}
      {activeTab === 4 && renderTab4()}

      {/* TKPI Database Modal */}
      {renderTkpiModal()}

      {/* Recipe Editor Modal */}
      {renderRecipeEditorModal()}

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmModal()}
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════
//  DESIGN STYLING SYSTEM
// ═══════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D13',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#A5ACCC',
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#161B29',
    margin: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.04)',
  },
  tabButtonText: {
    color: '#626C90',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#4ADE80',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#161B29',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  label: {
    color: '#A5ACCC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(15, 18, 28, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 8,
    color: '#F1F3F9',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pickerBtn: {
    backgroundColor: 'rgba(15, 18, 28, 0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  pickerBtnActive: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
  },
  pickerBtnText: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '700',
  },
  pickerBtnTextActive: {
    color: '#4ADE80',
  },
  hint: {
    color: '#626C90',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  hintText: {
    color: '#A5ACCC',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 18, 28, 0.5)',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#161B29',
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  toggleBtnText: {
    color: '#626C90',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#4ADE80',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sliderButton: {
    backgroundColor: '#222A3F',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  sliderButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sliderMockTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#0F121C',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderMockFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 18, 28, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  summaryCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cellLabel: {
    color: '#626C90',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  cellSub: {
    color: '#626C90',
    fontSize: 9.5,
  },
  blueText: { color: '#60A5FA' },
  orangeText: { color: '#FB923C' },
  greenText: { color: '#4ADE80' },
  redText: { color: '#F87171' },
  yellowText: { color: '#FACC15' },
  cyanText: { color: '#22D3EE' },
  primaryButton: {
    backgroundColor: '#4ADE80',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#07090e',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
    marginLeft: 6,
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  menuHeader: {
    color: '#626C90',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: '#161B29',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
    width: '48%',
    marginBottom: 10,
    position: 'relative',
  },
  menuItemActive: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.04)',
  },
  checkMarkCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ADE80',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  itemEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  itemName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemPortion: {
    color: '#A5ACCC',
    fontSize: 10,
    marginBottom: 4,
  },
  itemGizi: {
    color: '#626C90',
    fontSize: 9.5,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(15, 18, 28, 0.5)',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  priceLabel: {
    fontSize: 10,
    color: '#626C90',
  },
  priceInput: {
    flex: 1,
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridInput: {
    backgroundColor: 'rgba(15, 18, 28, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 6,
    color: '#F1F3F9',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: '31%',
    marginBottom: 8,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
  },
  previewBox: {
    backgroundColor: '#161B29',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  previewTitle: {
    color: '#A5ACCC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pLabel: {
    color: '#626C90',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pValue: {
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2,
  },
  pSub: {
    color: '#626C90',
    fontSize: 9,
  },
  macroTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginVertical: 8,
  },
  macroBarSegment: {
    height: '100%',
  },
  macroLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  macroDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    marginRight: 4,
  },
  dotLabel: {
    color: '#A5ACCC',
    fontSize: 9.5,
    fontWeight: '600',
  },
  stepFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  ghostButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    color: '#A5ACCC',
    fontSize: 13,
    fontWeight: '700',
  },
  alertContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  alertContainerGreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.2)',
  },
  alertContainerOrange: {
    backgroundColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  alertTextText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  resultStatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rsCard: {
    backgroundColor: '#161B29',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    width: '48%',
    marginBottom: 10,
  },
  rsLabel: {
    color: '#626C90',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rsValue: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  rsSub: {
    color: '#626C90',
    fontSize: 9.5,
  },
  gbrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gbrLabel: {
    width: 75,
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '600',
  },
  gbrBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  gbrBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gbrValue: {
    width: 100,
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  matrixRowActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.03)',
    borderLeftWidth: 3,
    borderColor: '#4ADE80',
    paddingLeft: 6,
  },
  matrixColInfo: {
    flex: 2,
  },
  matrixAgeName: {
    color: '#FFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  matrixAgeSub: {
    color: '#626C90',
    fontSize: 9.5,
    marginTop: 1,
  },
  smallBadge: {
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 4,
  },
  smallBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  matrixColBars: {
    flex: 3,
  },
  matrixBarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matrixBarLabel: {
    color: '#626C90',
    fontSize: 9,
    width: 45,
    fontWeight: '700',
  },
  matrixTrackSmall: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 2,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  matrixFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  matrixBarPct: {
    color: '#FFF',
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },
  bahanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bahanColMain: {
    flex: 1,
  },
  bahanName: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  bahanPortion: {
    color: '#626C90',
    fontSize: 10,
    marginTop: 2,
  },
  bahanColQty: {
    alignItems: 'flex-end',
  },
  bahanTotalQty: {
    color: '#4ADE80',
    fontSize: 12.5,
    fontWeight: '800',
  },
  bahanCost: {
    color: '#626C90',
    fontSize: 10,
    marginTop: 2,
  },
  costLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  costLineLabel: {
    color: '#A5ACCC',
    fontSize: 12,
  },
  costLineValue: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  totalCostLine: {
    borderBottomWidth: 0,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 4,
    paddingTop: 12,
  },
  totalCostLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  totalCostValue: {
    color: '#4ADE80',
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: 'rgba(74, 222, 128, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  actionsContainer: {
    marginVertical: 20,
  },
  // TKPI & Compliance Styles
  searchTkpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchTkpiBtnText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  complianceBadge: {
    position: 'absolute',
    top: 30,
    right: 8,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  complianceBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeAman: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  badgeDibatasi: {
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderColor: 'rgba(250, 204, 21, 0.3)',
  },
  badgeDilarang: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  textAman: { color: '#4ADE80' },
  textDibatasi: { color: '#FACC15' },
  textDilarang: { color: '#F87171' },
  complianceAlertBox: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  complianceAlertRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  complianceAlertYellow: {
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  complianceAlertGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  complianceAlertTitleRed: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  complianceAlertTitleYellow: {
    color: '#FACC15',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  complianceAlertTitleGreen: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  complianceAlertDesc: {
    color: '#A5ACCC',
    fontSize: 11,
    lineHeight: 15,
  },
  complianceAlertItem: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#101422',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    padding: 16,
    borderTopWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    backgroundColor: '#07090e',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 10,
  },
  modalClearBtn: {
    padding: 4,
  },
  modalList: {
    flex: 1,
  },
  modalEmptyText: {
    color: '#626C90',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  tkpiRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B29',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  tkpiIcon: {
    fontSize: 22,
  },
  tkpiNameText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tkpiNutrientDesc: {
    color: '#626C90',
    fontSize: 10.5,
    marginTop: 2,
  },
  statusBadgeSmall: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusBadgeTextSmall: {
    fontSize: 9,
    fontWeight: '800',
  },
  portionPane: {
    flex: 1,
  },
  backBtn: {
    marginBottom: 14,
  },
  backBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
  },
  selectedHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  selectedIcon: {
    fontSize: 26,
  },
  selectedName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  selectedCategory: {
    color: '#626C90',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
  complianceNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  noteBoxGreen: {
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    borderColor: 'rgba(74, 222, 128, 0.15)',
  },
  noteBoxYellow: {
    backgroundColor: 'rgba(250, 204, 21, 0.05)',
    borderColor: 'rgba(250, 204, 21, 0.15)',
  },
  noteBoxRed: {
    backgroundColor: 'rgba(248, 113, 113, 0.05)',
    borderColor: 'rgba(248, 113, 113, 0.15)',
  },
  complianceNoteText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  paneLabel: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  portionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07090e',
    borderWidth: 1.5,
    borderColor: '#4ADE80',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  portionTextInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    paddingVertical: 10,
  },
  portionUnitLabel: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '800',
  },
  nutrientsPreviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  nutrItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutrVal: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  nutrLbl: {
    color: '#626C90',
    fontSize: 9,
    marginTop: 2,
  },
  useBtn: {
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  useBtnText: {
    color: '#07090e',
    fontSize: 13,
    fontWeight: '800',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderCell: {
    color: '#626C90',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableCategoryHeader: {
    color: '#A5ACCC',
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginVertical: 6,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCellName: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableCellPortion: {
    color: '#A5ACCC',
    fontSize: 11,
  },
  tableCellTotal: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  tableCellPrice: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  topInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  topInfoCard: {
    flex: 1,
    backgroundColor: '#181C27',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  topInfoLabel: {
    color: '#626C90',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  topInfoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  topInfoSub: {
    color: '#626C90',
    fontSize: 9,
    marginTop: 2,
  },
  sectionSubTitle: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pelengkapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  pelengkapCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#181C27',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    margin: 4,
  },
  pelengkapLabel: {
    color: '#626C90',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 2,
  },
  pelengkapValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pelengkapSub: {
    color: '#4ADE80',
    fontSize: 9,
    marginTop: 2,
  },
  utamaBadge: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
    alignSelf: 'center',
  },
  utamaBadgeText: {
    color: '#60A5FA',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  qcCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(15, 18, 28, 0.3)',
    marginBottom: 10,
  },
  qcCheckRowActive: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74, 222, 128, 0.04)',
  },
  qcLabel: {
    color: '#A5ACCC',
    fontSize: 12.5,
    fontWeight: '700',
  },
  qcLabelActive: {
    color: '#4ADE80',
  },
  qcDesc: {
    color: '#626C90',
    fontSize: 10,
    marginTop: 2,
    lineHeight: 13,
  },
  editRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  editRecipeBtnText: {
    color: '#60A5FA',
    fontSize: 9.5,
    fontWeight: '800',
    marginLeft: 3,
  },
  itemIngredientsText: {
    color: '#A5ACCC',
    fontSize: 9.5,
    marginTop: 4,
    fontStyle: 'italic',
    paddingHorizontal: 2,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 18, 28, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  dropdownHeaderText: {
    color: '#F1F3F9',
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownListContainer: {
    backgroundColor: 'rgba(15, 18, 28, 0.95)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    color: '#A5ACCC',
    fontSize: 12,
    fontWeight: '700',
  },
  smallBtn: {
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gizseeTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 2,
  },
  gizseeSubtitle: {
    color: '#A5ACCC',
    fontSize: 14,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calcInputNamaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2538',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  calcInputNamaBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  calcInputNamaPlaceholder: {
    color: '#626C90',
    fontSize: 14,
    marginLeft: 8,
  },
  calcInputBerat: {
    width: 80,
    backgroundColor: '#1E2538',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    color: '#FFF',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginLeft: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  calcTrashBtn: {
    padding: 10,
    marginLeft: 5,
  },
  gizseeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gizseeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  gizseeActionBtnLeft: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  gizseeActionBtnLeftText: {
    color: '#A5ACCC',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  gizseeActionBtnRight: {
    backgroundColor: '#3B82F6',
  },
  gizseeActionBtnRightText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  gizseeHasilCard: {
    backgroundColor: '#161B29',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  gizseeHasilTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  gizseeHasilGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gizseeHasilCol: {
    flex: 0.48,
  },
  gizseeHasilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  gizseeHasilLabel: {
    color: '#A5ACCC',
    fontSize: 13,
  },
  gizseeHasilVal: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gizseeReportCard: {
    backgroundColor: '#1E2538',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2B354F',
  },
  gbrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gbrLabel: {
    color: '#A5ACCC',
    fontSize: 12,
    width: 90,
  },
  gbrBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  gbrBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  gbrValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    width: 35,
    textAlign: 'right',
  },
  gizseeNarrativeText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  riwayatTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 10,
  },
  riwayatCard: {
    backgroundColor: '#161B29',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3042',
  },
  riwayatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riwayatTime: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '600',
  },
  riwayatGiziRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  riwayatGiziBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  riwayatGiziText: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '700',
  },
  riwayatBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
    paddingTop: 8,
  },
  riwayatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  riwayatBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
    marginVertical: 4,
  },
  checklistText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  calcRowNutritionDetail: {
    marginTop: -8,
    marginLeft: 12,
    marginBottom: 8,
    paddingLeft: 34,
  },
  calcRowNutritionText: {
    color: '#A5ACCC',
    fontSize: 11,
    fontWeight: '600',
  },
  gizseeExportBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  gizseeExportBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  aiCard: {
    borderColor: '#4A1D96',
    borderWidth: 1,
    backgroundColor: 'rgba(74, 29, 150, 0.08)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardTitle: {
    color: '#C084FC',
    fontSize: 15,
    fontWeight: '700',
  },
  aiCardDesc: {
    color: '#A5ACCC',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  aiInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  aiTextInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A3042',
  },
  aiSubmitBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSubmitBtnDisabled: {
    backgroundColor: '#4C1D95',
  },
  aiSubmitBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  aiResponseWrapper: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  aiChatBubble: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  aiChatBubbleText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 20,
  },
  aiPreviewLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  aiIngredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  aiIngredientText: {
    color: '#FFF',
    fontSize: 13,
  },
  aiIngredientWeight: {
    color: '#F472B6',
    fontWeight: '700',
    fontSize: 13,
  },
  aiApplyBtn: {
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },
  aiApplyBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scaleAkgBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  scaleAkgBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  kitchenLogisticsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  kitchenDescText: {
    color: '#A5ACCC',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  kitchenLogisticsList: {
    marginTop: 8,
  },
  kitchenLogisticsItem: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  kitchenItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 6,
  },
  kitchenItemName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  kitchenItemYield: {
    color: '#F472B6',
    fontSize: 11,
    fontWeight: '600',
  },
  kitchenItemGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kitchenItemCol: {
    flex: 1,
  },
  kitchenItemLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 2,
  },
  kitchenItemVal: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
