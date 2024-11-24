// app.js
$(document).ready(function() {
    const API_BASE_URL = 'http://localhost:3000/api';

    // Handle search
    $('#searchBtn').click(function() {
        const teamName = $('#teamSearch').val();
        if (teamName) {
            searchTeam(teamName);
        }
    });

    // Allow search on Enter key
    $('#teamSearch').keypress(function(e) {
        if (e.which == 13) {
            const teamName = $(this).val();
            if (teamName) {
                searchTeam(teamName);
            }
        }
    });

    function searchTeam(teamName) {
        $.ajax({
            url: `${API_BASE_URL}/teams/search`,
            method: 'GET',
            data: { name: teamName },
            beforeSend: function() {
                // Show loading state
                $('#searchBtn').prop('disabled', true).text('Searching...');
            },
            success: function(data) {
                displayTeamData(data);
                fetchUpcomingGames(data.id);
                fetchHistoricalGames(data.id);
                fetchOddsComparison(data.id);
            },
            error: function(xhr) {
                alert('Error searching for team. Please try again.');
            },
            complete: function() {
                // Reset button state
                $('#searchBtn').prop('disabled', false).text('Search');
            }
        });
    }

    function displayTeamData(team) {
        $('#teamName').text(team.name);
        $('#teamRanking').text('#' + team.ranking);
        $('#teamRecord').text(team.season_record);
        $('#teamConference').text(team.conference);
        $('#teamInfo').removeClass('hidden');
    }

    function fetchUpcomingGames(teamId) {
        $.ajax({
            url: `${API_BASE_URL}/teams/${teamId}/upcoming`,
            method: 'GET',
            success: function(games) {
                const tbody = $('#upcomingGamesTable tbody');
                tbody.empty();

                games.forEach(game => {
                    const row = $('<tr>');
                    row.append(`
                        <td>${formatDate(game.date)}</td>
                        <td>${game.opponent}</td>
                        <td>${formatSpread(game.spread)}</td>
                        <td>${formatMoneyline(game.moneyline)}</td>
                        <td>${game.over_under}</td>
                    `);
                    tbody.append(row);
                });
            }
        });
    }

    function fetchHistoricalGames(teamId) {
        $.ajax({
            url: `${API_BASE_URL}/teams/${teamId}/history`,
            method: 'GET',
            success: function(games) {
                const tbody = $('#historicalGamesTable tbody');
                tbody.empty();

                games.forEach(game => {
                    const row = $('<tr>');
                    row.append(`
                        <td>${formatDate(game.date)}</td>
                        <td>${game.opponent}</td>
                        <td>${game.result}</td>
                        <td>${game.score}</td>
                        <td>${formatSpread(game.spread)}</td>
                    `);
                    tbody.append(row);
                });
            }
        });
    }

    function fetchOddsComparison(teamId) {
        $.ajax({
            url: `${API_BASE_URL}/teams/${teamId}/odds`,
            method: 'GET',
            success: function(oddsData) {
                const oddsContainer = $('#oddsCards');
                oddsContainer.empty();

                Object.entries(oddsData).forEach(([bookmaker, odds]) => {
                    const card = $('<div>').addClass('odds-card');
                    card.append(`
                        <h4>${bookmaker}</h4>
                        <p>Spread: ${formatSpread(odds.spread)} (${odds.spread_odds})</p>
                        <p>Moneyline: ${formatMoneyline(odds.moneyline)}</p>
                        <p>Over/Under: ${odds.over_under} (${odds.over_under_odds})</p>
                    `);
                    oddsContainer.append(card);
                });
            }
        });
    }

    // Utility functions
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function formatSpread(spread) {
        return spread > 0 ? `+${spread}` : spread;
    }

    function formatMoneyline(moneyline) {
        return moneyline > 0 ? `+${moneyline}` : moneyline;
    }
});
