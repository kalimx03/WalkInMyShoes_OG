
import React from 'react';

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  SIMULATION_SELECTOR = 'SIMULATION_SELECTOR',
  VISION_SCENE = 'VISION_SCENE',
  HEARING_SCENE = 'HEARING_SCENE',
  MOTOR_SCENE = 'MOTOR_SCENE',
  COLOR_BLIND_SCENE = 'COLOR_BLIND_SCENE',
  AR_AUDITOR = 'AR_AUDITOR',
  RESULTS = 'RESULTS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isHidden?: boolean;
}

export interface EmpathyStats {
  scenariosCompleted: number;
  empathyScore: number;
  auditReportsGenerated: number;
  timeSpentMinutes: number;
  chatHistories: Record<string, ChatMessage[]>;
}

export interface AuditIssue {
  type: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
  description: string;
  recommendation: string;
  costEstimate: string;
  // Normalized coordinates [ymin, xmin, ymax, xmax] from 0 to 1000
  coordinates?: [number, number, number, number];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  icon: string;
  isNew?: boolean;
}

// Global augmentation for A-Frame custom elements. 
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-camera': any;
      'a-entity': any;
      'a-sky': any;
      'a-light': any;
      'a-plane': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-circle': any;
      'a-text': any;
      'a-ring': any;
      'a-cone': any;
      'a-torus': any;
      [elemName: string]: any;
    }
  }
}

// React specific JSX augmentation for modern React versions
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-camera': any;
      'a-entity': any;
      'a-sky': any;
      'a-light': any;
      'a-plane': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-circle': any;
      'a-text': any;
      'a-ring': any;
      'a-cone': any;
      'a-torus': any;
      [elemName: string]: any;
    }
  }
}
