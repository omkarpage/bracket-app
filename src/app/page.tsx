"use client";
import { useState, useEffect, useRef } from 'react';
import styles from './things.module.css';

interface Team {
  id: number;
  name: string;
}

interface Match {
  id: string;
  round: number;
  bracket: 'winners' | 'losers' | 'final';
  team1Id: number | null;
  team2Id: number | null;
  winnerId: number | null;
  loserId: number | null;
  nextMatchId: string | null;
  loserNextMatchId: string | null;
}

export default function DoubleElimination() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1' },
    { id: 2, name: 'Team 2' },
    { id: 3, name: 'Team 3' },
    { id: 4, name: 'Team 4' },
    { id: 5, name: 'Team 5' },
    { id: 6, name: 'Team 6' },
    { id: 7, name: 'Team 7' },
    { id: 8, name: 'Team 8' },
  ]);

  const [matches, setMatches] = useState<Match[]>([]);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const shuffleTeams = (teams: Team[]): Team[] => {
    const shuffled = [...teams];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const randomizeBracket = () => {
    const shuffledTeams = shuffleTeams(teams);
    setTeams(shuffledTeams);

    const initialMatches: Match[] = [
      //Winners Bracked Round 1
      { id: 'W1', round: 1, bracket: 'winners', team1Id: shuffledTeams[0].id, team2Id: shuffledTeams[1].id, winnerId: null, loserId: null, nextMatchId: 'W5', loserNextMatchId: 'L1' },
      { id: 'W2', round: 1, bracket: 'winners', team1Id: shuffledTeams[2].id, team2Id: shuffledTeams[3].id, winnerId: null, loserId: null, nextMatchId: 'W5', loserNextMatchId: 'L1' },
      { id: 'W3', round: 1, bracket: 'winners', team1Id: shuffledTeams[4].id, team2Id: shuffledTeams[5].id, winnerId: null, loserId: null, nextMatchId: 'W6', loserNextMatchId: 'L2' },
      { id: 'W4', round: 1, bracket: 'winners', team1Id: shuffledTeams[6].id, team2Id: shuffledTeams[7].id, winnerId: null, loserId: null, nextMatchId: 'W6', loserNextMatchId: 'L2' },

      // Winners Bracket Round 2
      { id: 'W5', round: 2, bracket: 'winners', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'W7', loserNextMatchId: 'L3' },
      { id: 'W6', round: 2, bracket: 'winners', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'W7', loserNextMatchId: 'L4' },

      // Winners Bracket Final
      { id: 'W7', round: 3, bracket: 'winners', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'F1', loserNextMatchId: 'L6' },

      // Losers Bracket Round 1 - Losers from Winners Round 1
      { id: 'L1', round: 1, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'L3', loserNextMatchId: null },
      { id: 'L2', round: 1, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'L4', loserNextMatchId: null },

      // Losers Bracket Round 2 - Winners from Round 1 vs Losers from Winners Round 2
      { id: 'L3', round: 2, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'L5', loserNextMatchId: null },
      { id: 'L4', round: 2, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'L5', loserNextMatchId: null },

      // Losers Bracket Round 3 - Semifinal
      { id: 'L5', round: 3, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'L6', loserNextMatchId: null },

      // Losers Bracket Round 4 - Final (winner from L5 vs loser from W7)
      { id: 'L6', round: 4, bracket: 'losers', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: 'F1', loserNextMatchId: null },

      { id: 'F1', round: 1, bracket: 'final', team1Id: null, team2Id: null, winnerId: null, loserId: null, nextMatchId: null, loserNextMatchId: null },
    ];

    setMatches(initialMatches);
    setIsInitialized(true);
  };

  useEffect(() => {
    if (!isInitialized) {
      randomizeBracket();
    }
  }, [isInitialized]);

  const resetTournament = () => {
    setTeams(teams.map((team, index) => ({
      ...team,
      name: `Team ${index + 1}`
    })));

    setIsInitialized(false);
  };

  const exportData = () => {
    const tournamentData = {
      teams,
      matches,
      isInitialized
    };
    
    const dataStr = JSON.stringify(tournamentData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `bracket-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    
    fileReader.onload = (e) => {
      try {
        if (e.target?.result) {
          const importedData = JSON.parse(e.target.result as string);
          
          if (!importedData.teams || !importedData.matches) {
            alert('Invalid bracket data format');
            return;
          }
          
          setTeams(importedData.teams);
          setMatches(importedData.matches);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('Failed to import bracket data');
      }
    };
    
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMatch = (matchId: string, winnerId: number | null) => {
    setMatches(prevMatches => {
      const updatedMatches = [...prevMatches];
      const matchIndex = updatedMatches.findIndex(m => m.id === matchId);

      if (matchIndex === -1 || !winnerId) return updatedMatches;

      const match = updatedMatches[matchIndex];

      if (match.team1Id === null || match.team2Id === null) return updatedMatches;

      const loserId = match.team1Id === winnerId ? match.team2Id : match.team1Id;

      updatedMatches[matchIndex] = {
        ...match,
        winnerId,
        loserId
      };

      if (match.nextMatchId) {
        const nextMatchIndex = updatedMatches.findIndex(m => m.id === match.nextMatchId);
        if (nextMatchIndex !== -1) {
          const nextMatch = updatedMatches[nextMatchIndex];

          if (match.bracket === 'winners') {
            const matchNum = parseInt(match.id.substring(1));
            if (matchNum % 2 === 1) {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                team1Id: winnerId
              };
            } else {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                team2Id: winnerId
              };
            }
          }
          else if (match.bracket === 'losers') {
            if (match.id === 'L1' || match.id === 'L2') {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                team1Id: winnerId
              };
            } else if (match.id === 'L3' || match.id === 'L4') {
              if (match.id === 'L3') {
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  team1Id: winnerId
                };
              } else {
                updatedMatches[nextMatchIndex] = {
                  ...nextMatch,
                  team2Id: winnerId
                };
              }
            } else if (match.id === 'L5') {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                team1Id: winnerId
              };
            } else if (match.id === 'L6') {
              updatedMatches[nextMatchIndex] = {
                ...nextMatch,
                team2Id: winnerId
              };
            }
          }
        }
      }

      if (match.loserNextMatchId && loserId) {
        const loserNextMatchIndex = updatedMatches.findIndex(m => m.id === match.loserNextMatchId);
        if (loserNextMatchIndex !== -1) {
          const loserNextMatch = updatedMatches[loserNextMatchIndex];

          if (match.bracket === 'winners') {
            if (match.id === 'W1' || match.id === 'W2') {
              if (loserNextMatch.team1Id === null) {
                updatedMatches[loserNextMatchIndex] = {
                  ...loserNextMatch,
                  team1Id: loserId
                };
              } else {
                updatedMatches[loserNextMatchIndex] = {
                  ...loserNextMatch,
                  team2Id: loserId
                };
              }
            } else if (match.id === 'W3' || match.id === 'W4') {
              if (loserNextMatch.team1Id === null) {
                updatedMatches[loserNextMatchIndex] = {
                  ...loserNextMatch,
                  team1Id: loserId
                };
              } else {
                updatedMatches[loserNextMatchIndex] = {
                  ...loserNextMatch,
                  team2Id: loserId
                };
              }
            } else if (match.id === 'W5') {
              updatedMatches[loserNextMatchIndex] = {
                ...loserNextMatch,
                team2Id: loserId
              };
            } else if (match.id === 'W6') {
              updatedMatches[loserNextMatchIndex] = {
                ...loserNextMatch,
                team2Id: loserId
              };
            } else if (match.id === 'W7') {
              updatedMatches[loserNextMatchIndex] = {
                ...loserNextMatch,
                team2Id: loserId
              };
            }
          }
        }
      }

      return updatedMatches;
    });
  };

  const startEditingTeam = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setEditingTeamId(teamId);
      setEditingName(team.name);
    }
  };

  const saveTeamName = () => {
    if (editingTeamId) {
      setTeams(teams.map(team =>
        team.id === editingTeamId ? { ...team, name: editingName } : team
      ));
      setEditingTeamId(null);
    }
  };

  const getTeam = (teamId: number | null) => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId) || null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <button 
          className="px-4 py-2 bg-blue-500 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-md flex items-center justify-center transition-all duration-200 hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" 
          onClick={randomizeBracket}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Randomize Bracket
        </button>
        
        <button 
          className="px-4 py-2 bg-red-500 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-md flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" 
          onClick={resetTournament}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M3 2v6h6"></path>
            <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
            <path d="M21 22v-6h-6"></path>
            <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
          </svg>
          Reset Tournament
        </button>
        
        {/* Export button with Tailwind classes */}
        <button 
          className="px-4 py-2 bg-green-500 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-md flex items-center justify-center transition-all duration-200 hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" 
          onClick={exportData}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export Bracket
        </button>
        
        <button 
          className="px-4 py-2 bg-yellow-500 text-white font-bold text-sm uppercase tracking-wider rounded-md shadow-md flex items-center justify-center transition-all duration-200 hover:bg-yellow-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" 
          onClick={() => fileInputRef.current?.click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Import Bracket
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={importData}
          accept=".json"
          className="hidden"
        />
      </div>

      <div className={styles.teamList}>
        <h2>Teams</h2>
        <div className={styles.teams}>
          {teams.map(team => (
            <div key={team.id} className={styles.teamItem}>
              {editingTeamId === team.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={saveTeamName}
                    onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                    autoFocus
                  />
                </>
              ) : (
                <div onClick={() => startEditingTeam(team.id)}>
                  {team.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.brackets}>
        <div className={styles.winnersBracket}>
          <h2>Winners Bracket</h2>
          <div className={styles.rounds}>
            {[1, 2, 3].map(round => (
              <div key={round} className={styles.round}>
                <h3>Round {round}</h3>
                {matches
                  .filter(m => m.bracket === 'winners' && m.round === round)
                  .map(match => (
                    <div key={match.id} className={styles.match}>
                      <div
                        className={`${styles.team} ${match.winnerId === match.team1Id ? styles.winner : ''}`}
                        onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team1Id)}
                      >
                        {getTeam(match.team1Id)?.name || 'TBD'}
                      </div>
                      <div
                        className={`${styles.team} ${match.winnerId === match.team2Id ? styles.winner : ''}`}
                        onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team2Id)}
                      >
                        {getTeam(match.team2Id)?.name || 'TBD'}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.losersBracket}>
          <h2>Losers Bracket</h2>
          <div className={styles.rounds}>
            {[1, 2, 3, 4].map(round => (
              <div key={round} className={styles.round}>
                <h3>Round {round}</h3>
                {matches
                  .filter(m => m.bracket === 'losers' && m.round === round)
                  .map(match => (
                    <div key={match.id} className={styles.match}>
                      <div
                        className={`${styles.team} ${match.winnerId === match.team1Id ? styles.winner : ''}`}
                        onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team1Id)}
                      >
                        {getTeam(match.team1Id)?.name || 'TBD'}
                      </div>
                      <div
                        className={`${styles.team} ${match.winnerId === match.team2Id ? styles.winner : ''}`}
                        onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team2Id)}
                      >
                        {getTeam(match.team2Id)?.name || 'TBD'}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.finalBracket}>
          <h2>Final</h2>
          <div className={styles.rounds}>
            {matches
              .filter(m => m.bracket === 'final')
              .map(match => (
                <div key={match.id} className={styles.match}>
                  <div
                    className={`${styles.team} ${match.winnerId === match.team1Id ? styles.winner : ''}`}
                    onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team1Id)}
                  >
                    {getTeam(match.team1Id)?.name || 'TBD'}
                  </div>
                  <div
                    className={`${styles.team} ${match.winnerId === match.team2Id ? styles.winner : ''}`}
                    onClick={() => match.team1Id && match.team2Id && updateMatch(match.id, match.team2Id)}
                  >
                    {getTeam(match.team2Id)?.name || 'TBD'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {matches.find(m => m.bracket === 'final' && m.winnerId) && (
        <div className={styles.champion}>
          <h2>Champion</h2>
          <div className={styles.championTeam}>
            {getTeam(matches.find(m => m.bracket === 'final')?.winnerId || null)?.name}
          </div>
        </div>
      )}
    </div>
  );
}