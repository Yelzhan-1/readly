import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionRunner from '../../components/child/SessionRunner.jsx';

const MODULES = {
  letters: { questItem: 'letters', size: 4 },
  reading: { questItem: 'reading', size: 3 },
  writing: { questItem: 'writing', size: 4 },
  game: { questItem: 'game', size: 4 },
  practice: { questItem: null, size: 4 },
};

export default function SessionPage() {
  const { module } = useParams();
  const navigate = useNavigate();
  const conf = MODULES[module] || MODULES.practice;

  return (
    <SessionRunner
      key={module}
      module={MODULES[module] ? module : 'practice'}
      size={conf.size}
      questItem={conf.questItem}
      onExit={() => navigate('/learn', { replace: true })}
    />
  );
}
