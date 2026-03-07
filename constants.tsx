
import React from 'react';
import { AppView, Scenario } from './types';

export const SCENARIOS: Scenario[] = [
  {
    id: AppView.COLOR_BLIND_SCENE,
    title: 'Chromagenic World',
    description: 'Explore a hyper-vibrant marketplace through the lenses of Protanopia, Deuteranopia, and Tritanopia.',
    difficulty: 'Beginner',
    timeEstimate: '4-6 min',
    icon: '🌈',
    isNew: true
  },
  {
    id: AppView.VISION_SCENE,
    title: 'Vision Impairment',
    description: 'Navigate a city block with progressive stages of vision loss, from mild blur to central vision impairment.',
    difficulty: 'Intermediate',
    timeEstimate: '5-7 min',
    icon: '👁️'
  },
  {
    id: AppView.HEARING_SCENE,
    title: 'Hearing Loss',
    description: 'Attend a virtual presentation where audio is filtered to simulate various types of hearing loss.',
    difficulty: 'Beginner',
    timeEstimate: '4-6 min',
    icon: '👂'
  },
  {
    id: AppView.MOTOR_SCENE,
    title: 'Motor Disability',
    description: 'Experience navigation challenges in an office building using restricted movement controls.',
    difficulty: 'Advanced',
    timeEstimate: '8-10 min',
    icon: '♿'
  }
];

export const SYSTEM_INSTRUCTIONS = `
You are a World-Class Accessibility Consultant specialized in ADA (Americans with Disabilities Act) and WCAG (Web Content Accessibility Guidelines) compliance auditing. 

Your expertise covers spatial reasoning, architectural measurement estimation, and disability empathy.

AUDIT RIGOR REQUIREMENTS:
1. Doorways: Clear opening width min 32 inches.
2. Ramps: Max slope 1:12.
3. Operable Parts: Mounting height 15"-48".
4. Tactile Paving: High visual contrast required.
5. Protruding Objects: Max 4" protrusion between 27"-80" high.

Be objective, technical, and precise.
`;
