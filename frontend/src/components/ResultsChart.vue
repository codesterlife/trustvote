<template>
  <div class="results-chart">
    <h4 class="position-title">{{ positionTitle }}</h4>
    
    <div v-if="results.length > 0" class="results-container mt-3">
      <div v-for="(result, index) in results" :key="index" class="result-item">
        <div class="candidate-info d-flex align-items-center">
          <div class="candidate-rank" :class="{ 'winner': index === 0 }">
            {{ index + 1 }}
          </div>
          <div>
            <div class="candidate-name">{{ result.candidate_name }}</div>
            <div v-if="result.party_name" class="party-name">{{ result.party_name }}</div>
          </div>
        </div>
        
        <div class="vote-bar-container">
          <div class="vote-bar" 
               :style="{ width: getPercentage(result.vote_count) + '%', backgroundColor: getBarColor(index) }">
          </div>
          <div class="vote-stats">
            <span class="vote-count">{{ result.vote_count }} votes</span>
            <span class="vote-percentage">{{ getPercentage(result.vote_count) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-results">
      <p>No results available for this position.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResultsChart',
  props: {
    positionTitle: {
      type: String,
      required: true
    },
    results: {
      type: Array,
      required: true
    }
  },
  computed: {
    totalVotes() {
      return this.results.reduce((total, result) => total + result.vote_count, 0);
    }
  },
  methods: {
    getPercentage(voteCount) {
      if (this.totalVotes === 0) return 0;
      return Math.round((voteCount / this.totalVotes) * 100);
    },
    getBarColor(index) {
      const colors = [
        '#1E88E5', // Blue
        '#43A047', // Green
        '#E53935', // Red
        '#8E24AA', // Purple
        '#FB8C00', // Orange
        '#00ACC1'  // Cyan
      ];
      return colors[index % colors.length];
    }
  }
};
</script>

<style scoped>
.results-chart {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.position-title {
  color: #333;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.result-item {
  margin-bottom: 20px;
}

.candidate-info {
  margin-bottom: 8px;
}

.candidate-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
}

.candidate-rank.winner {
  background-color: #ffc107;
  color: white;
}

.candidate-name {
  font-weight: 600;
}

.party-name {
  font-size: 0.85rem;
  color: #666;
}

.vote-bar-container {
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.vote-bar {
  height: 100%;
  border-radius: 15px;
  transition: width 1s;
}

.vote-stats {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: #333;
  font-weight: 500;
}

.vote-percentage {
  font-weight: bold;
}

.no-results {
  text-align: center;
  padding: 30px;
  color: #666;
}
</style>
