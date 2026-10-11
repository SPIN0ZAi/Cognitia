import type { CityNode } from '../types/graph';

export const ROMANIA_GRAPH: Record<string, CityNode> = {
  Arad: {
    name: 'Arad',
    x: 90,
    y: 190,
    straightLineToBucharest: 366,
    connections: [
      { target: 'Zerind', cost: 75 },
      { target: 'Sibiu', cost: 140 },
      { target: 'Timisoara', cost: 118 },
    ],
  },
  Zerind: {
    name: 'Zerind',
    x: 135,
    y: 115,
    straightLineToBucharest: 374,
    connections: [
      { target: 'Arad', cost: 75 },
      { target: 'Oradea', cost: 71 },
    ],
  },
  Oradea: {
    name: 'Oradea',
    x: 175,
    y: 50,
    straightLineToBucharest: 380,
    connections: [
      { target: 'Zerind', cost: 71 },
      { target: 'Sibiu', cost: 151 },
    ],
  },
  Timisoara: {
    name: 'Timisoara',
    x: 95,
    y: 330,
    straightLineToBucharest: 329,
    connections: [
      { target: 'Arad', cost: 118 },
      { target: 'Lugoj', cost: 111 },
    ],
  },
  Lugoj: {
    name: 'Lugoj',
    x: 215,
    y: 410,
    straightLineToBucharest: 244,
    connections: [
      { target: 'Timisoara', cost: 111 },
      { target: 'Mehadia', cost: 70 },
    ],
  },
  Mehadia: {
    name: 'Mehadia',
    x: 220,
    y: 505,
    straightLineToBucharest: 241,
    connections: [
      { target: 'Lugoj', cost: 70 },
      { target: 'Drobeta', cost: 75 },
    ],
  },
  Drobeta: {
    name: 'Drobeta',
    x: 210,
    y: 600,
    straightLineToBucharest: 242,
    connections: [
      { target: 'Mehadia', cost: 75 },
      { target: 'Craiova', cost: 120 },
    ],
  },
  Craiova: {
    name: 'Craiova',
    x: 350,
    y: 640,
    straightLineToBucharest: 160,
    connections: [
      { target: 'Drobeta', cost: 120 },
      { target: 'Rimnicu Vilcea', cost: 146 },
      { target: 'Pitesti', cost: 138 },
    ],
  },
  Sibiu: {
    name: 'Sibiu',
    x: 300,
    y: 240,
    straightLineToBucharest: 253,
    connections: [
      { target: 'Arad', cost: 140 },
      { target: 'Oradea', cost: 151 },
      { target: 'Fagaras', cost: 99 },
      { target: 'Rimnicu Vilcea', cost: 80 },
    ],
  },
  'Rimnicu Vilcea': {
    name: 'Rimnicu Vilcea',
    x: 345,
    y: 360,
    straightLineToBucharest: 193,
    connections: [
      { target: 'Sibiu', cost: 80 },
      { target: 'Craiova', cost: 146 },
      { target: 'Pitesti', cost: 97 },
    ],
  },
  Fagaras: {
    name: 'Fagaras',
    x: 480,
    y: 260,
    straightLineToBucharest: 176,
    connections: [
      { target: 'Sibiu', cost: 99 },
      { target: 'Bucharest', cost: 211 },
    ],
  },
  Pitesti: {
    name: 'Pitesti',
    x: 505,
    y: 475,
    straightLineToBucharest: 100,
    connections: [
      { target: 'Rimnicu Vilcea', cost: 97 },
      { target: 'Craiova', cost: 138 },
      { target: 'Bucharest', cost: 101 },
    ],
  },
  Bucharest: {
    name: 'Bucharest',
    x: 650,
    y: 540,
    straightLineToBucharest: 0,
    connections: [
      { target: 'Fagaras', cost: 211 },
      { target: 'Pitesti', cost: 101 },
      { target: 'Giurgiu', cost: 90 },
      { target: 'Urziceni', cost: 85 },
    ],
  },
  Giurgiu: {
    name: 'Giurgiu',
    x: 600,
    y: 670,
    straightLineToBucharest: 77,
    connections: [{ target: 'Bucharest', cost: 90 }],
  },
  Urziceni: {
    name: 'Urziceni',
    x: 770,
    y: 500,
    straightLineToBucharest: 80,
    connections: [
      { target: 'Bucharest', cost: 85 },
      { target: 'Hirsova', cost: 98 },
      { target: 'Vaslui', cost: 142 },
    ],
  },
  Hirsova: {
    name: 'Hirsova',
    x: 885,
    y: 510,
    straightLineToBucharest: 151,
    connections: [
      { target: 'Urziceni', cost: 98 },
      { target: 'Eforie', cost: 86 },
    ],
  },
  Eforie: {
    name: 'Eforie',
    x: 935,
    y: 630,
    straightLineToBucharest: 161,
    connections: [{ target: 'Hirsova', cost: 86 }],
  },
  Vaslui: {
    name: 'Vaslui',
    x: 840,
    y: 300,
    straightLineToBucharest: 199,
    connections: [
      { target: 'Urziceni', cost: 142 },
      { target: 'Iasi', cost: 92 },
    ],
  },
  Iasi: {
    name: 'Iasi',
    x: 800,
    y: 160,
    straightLineToBucharest: 226,
    connections: [
      { target: 'Vaslui', cost: 92 },
      { target: 'Neamt', cost: 87 },
    ],
  },
  Neamt: {
    name: 'Neamt',
    x: 670,
    y: 110,
    straightLineToBucharest: 234,
    connections: [{ target: 'Iasi', cost: 87 }],
  },
};
