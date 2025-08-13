interface TournamentMatch {
    player1: string;
    player2: string;
    winner?: string;
    status: 'pending' | 'playing' | 'finished';
    matchId?: string;
    score?: {
        player1: number;
        player2: number;
    };
}

interface TournamentRound {
    matches: TournamentMatch[];
    round: number;
    name: string;
}

interface TournamentData {
    matches: any[];
    participants: string[];
    currentRound: number;
    status: string;
}

export function getTournamentTree(container: HTMLElement, participants: string[], tournamentData?: TournamentData): void {
    const bracketData = tournamentData ? 
        generateTournamentBracketFromData(tournamentData) : 
        generateTournamentBracket(participants);
    container.innerHTML = renderTournamentTree(bracketData);
}
function generateTournamentBracketFromData(tournamentData: TournamentData): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    const participants = tournamentData.participants;
    let currentParticipants = [...participants];
    let roundNumber = 1;
    if (currentParticipants.length % 2 !== 0) {
        currentParticipants.push("BYE");
    }
    
    while (currentParticipants.length > 1) {
        const matches: TournamentMatch[] = [];
        const nextRoundParticipants: string[] = [];
        
        for (let i = 0; i < currentParticipants.length; i += 2) {
            const player1 = currentParticipants[i];
            const player2 = currentParticipants[i + 1];
            
            const realMatch = tournamentData.matches.find(m => {
                const match1 = m.participant1?.username === player1 && m.participant2?.username === player2;
                const match2 = m.participant1?.username === player2 && m.participant2?.username === player1;
                return match1 || match2 || 
                       (m.player1 === player1 && m.player2 === player2) || 
                       (m.player1 === player2 && m.player2 === player1);
            });
            
            let status: 'pending' | 'playing' | 'finished' = 'pending';
            let winner: string | undefined = undefined;
            
            if (realMatch) {
                if (realMatch.status === 'completed' || realMatch.status === 'finished') {
                    status = 'finished';
                } else if (realMatch.status === 'in_progress' || realMatch.status === 'playing') {
                    status = 'playing';
                } else {
                    status = 'pending';
                }
                
                if (realMatch.winner) {
                    winner = realMatch.winner;
                } else if (realMatch.winner_username) {
                    winner = realMatch.winner_username;
                } else if (realMatch.matchWinner) {
                    winner = realMatch.matchWinner === 'leftPlayer' ? 
                        (realMatch.participant1?.username || realMatch.player1) : 
                        (realMatch.participant2?.username || realMatch.player2);
                }
                
                console.log(`Match ${player1} vs ${player2}: status=${status}, winner=${winner}`);
            }
            
            matches.push({
                player1,
                player2,
                winner,
                status,
                matchId: realMatch?.id || realMatch?.match_id,
                score: realMatch?.score || realMatch?.final_score
            });
            
            if (winner) {
                nextRoundParticipants.push(winner);
            } else {
                nextRoundParticipants.push("TBD");
            }
        }
        
        let roundName = '';
        const participantCount = currentParticipants.length;
        
        if (participantCount === 2) {
            roundName = 'FİNAL';
        } else if (participantCount === 4) {
            roundName = 'YARI FİNAL';
        } else if (participantCount === 8) {
            roundName = 'ÇEYREK FİNAL';
        } else if (participantCount === 16) {
            roundName = 'SON 16';
        } else {
            roundName = `${roundNumber}. TUR`;
        }
        
        rounds.push({
            matches,
            round: roundNumber,
            name: roundName
        });
        
        currentParticipants = nextRoundParticipants;
        roundNumber++;
    }
    
    return rounds;
}

function generateTournamentBracket(participants: string[]): TournamentRound[] {
    const rounds: TournamentRound[] = [];
    let currentParticipants = [...participants];
    let roundNumber = 1;
    
    if (currentParticipants.length % 2 !== 0) {
        currentParticipants.push("BYE");
    }
    
    while (currentParticipants.length > 1) {
        const matches: TournamentMatch[] = [];
        const nextRoundParticipants: string[] = [];
        
        for (let i = 0; i < currentParticipants.length; i += 2) {
            const player1 = currentParticipants[i];
            const player2 = currentParticipants[i + 1];
            
            const status: 'pending' | 'playing' | 'finished' = 'pending';
            
            matches.push({
                player1,
                player2,
                winner: undefined,
                status
            });
            
            nextRoundParticipants.push("TBD");
        }
        
        let roundName = '';
        const participantCount = currentParticipants.length;
        
        if (participantCount === 2) {
            roundName = 'FİNAL';
        } else if (participantCount === 4) {
            roundName = 'YARI FİNAL';
        } else if (participantCount === 8) {
            roundName = 'ÇEYREK FİNAL';
        } else if (participantCount === 16) {
            roundName = 'SON 16';
        } else {
            roundName = `${roundNumber}. TUR`;
        }
        
        rounds.push({
            matches,
            round: roundNumber,
            name: roundName
        });
        
        currentParticipants = nextRoundParticipants;
        roundNumber++;
    }
    
    return rounds;
}

function renderTournamentTree(rounds: TournamentRound[]): string {
    const roundsHtml = rounds.map((round, index) => `
        <div class="tournament-round">
            <div class="round-title">
                ${round.name}
                ${round.name === 'FİNAL' ? '<div class="final-trophy">🏆</div>' : ''}
            </div>
            <div class="matches-container">
                ${round.matches.map(match => `
                    <div class="match-card">
                        <div class="match-status status-${match.status}">
                            ${match.status === 'pending' ? '⏱' : match.status === 'playing' ? '🎮' : '✓'}
                        </div>
                        <div class="player ${
                            match.player1 === 'TBD' ? 'tbd' : 
                            match.winner === match.player1 ? 'winner' : 
                            match.winner && match.winner !== match.player1 ? 'loser' : ''
                        }" 
                             data-player="${match.player1}" data-winner="${match.winner || ''}">
                            <span>${match.player1 === 'TBD' ? 'Maç Sonucu Bekleniyor' : match.player1}</span>
                            <div class="player-status">
                                ${match.winner === match.player1 ? '<span class="trophy">🏆</span>' : ''}
                                ${match.score ? `<span class="score">${match.score.player1 || 0}</span>` : ''}
                            </div>
                        </div>
                        <div class="vs-divider">${match.player1 === 'TBD' || match.player2 === 'TBD' ? '—' : 'VS'}</div>
                        <div class="player ${
                            match.player2 === 'TBD' ? 'tbd' : 
                            match.winner === match.player2 ? 'winner' : 
                            match.winner && match.winner !== match.player2 ? 'loser' : ''
                        }"
                             data-player="${match.player2}" data-winner="${match.winner || ''}">
                            <span>${match.player2 === 'TBD' ? 'Maç Sonucu Bekleniyor' : match.player2}</span>
                            <div class="player-status">
                                ${match.winner === match.player2 ? '<span class="trophy">🏆</span>' : ''}
                                ${match.score ? `<span class="score">${match.score.player2 || 0}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    return `
        <div class="tournament-container">
            <div class="tournament-bracket">
                ${roundsHtml}
            </div>
        </div>
    `;
}