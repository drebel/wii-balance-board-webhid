resample(data) { // Accept an array of arrays where each inner array contains [time, x, y] data
    const windowSize = 1; // Set the window size to 1
    const desiredFrequency = 25; // Set the desired frequency to 25
    const currentTime = Math.max(0, data[0][0]);
    const outputData = [];

    while (currentTime < data[data.length - 1][0]) {
        // Create an array to store relevant data point indices within the window
        const relevantTimes = [];

        // Find data points that fall within the current sliding window
        for (let t = 0; t < data.length; t++) {
            if (Math.abs(data[t][0] - currentTime) < windowSize * 0.5) {
                relevantTimes.push(t);
            }
        }

        if (relevantTimes.length === 1) {
            // If there's only one relevant data point, use it as is
            const t = relevantTimes[0];
            outputData.push([currentTime, data[t][1], data[t][2]]);
        } else {
            let sumX = 0;
            let sumY = 0;
            let weightSum = 0;

            // Calculate the weighted average of data points within the window
            for (let i = 0; i < relevantTimes.length; i++) {
                const t = relevantTimes[i];
                let leftBorder, rightBorder;

                if (i === 0 || t === 0) {
                    leftBorder = Math.max(data[0][0], currentTime - windowSize * 0.5);
                } else {
                    leftBorder = 0.5 * (data[t][0] + data[t - 1][0]);
                }

                if (i === relevantTimes.length - 1) {
                    rightBorder = Math.min(data[data.length - 1][0], currentTime + windowSize * 0.5);
                } else {
                    rightBorder = 0.5 * (data[t + 1][0] + data[t][0]);
                }

                const w = rightBorder - leftBorder;
                sumX += data[t][1] * w; // Accumulate weighted X values
                sumY += data[t][2] * w; // Accumulate weighted Y values
                weightSum += w;
            }

            const resampledX = sumX / weightSum;
            const resampledY = sumY / weightSum;

            outputData.push([currentTime, resampledX, resampledY]);
        }

        // Move the sliding window by incrementing the current time
        currentTime += 1 / desiredFrequency;
    }

    return outputData; // Return resampled data as an array of arrays
}