import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const studentId = params.id;

    const student = await Student.findById(studentId).populate('user_id');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch GitHub analytics if available
    let github_analytics = null;
    const username = student.github_username || student.github_data?.username;

    if (username) {
      try {
        // Fetch GitHub User Data
        const userResponse = await fetch(`https://api.github.com/users/${username}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'RecruitHirePro'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();

          // Fetch Repositories
          const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'RecruitHirePro'
            }
          });

          const repos = await reposResponse.json();

          // Calculate Language Statistics
          const languageStats = {};
          let totalSize = 0;

          for (const repo of repos) {
            if (repo.language) {
              languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size;
              totalSize += repo.size;
            }
          }

          // Convert to percentages
          const languagePercentages = Object.entries(languageStats).map(([language, size]) => ({
            language,
            percentage: ((size / totalSize) * 100).toFixed(2),
            size
          })).sort((a, b) => b.percentage - a.percentage);

          // Calculate Repository Type Distribution
          const repoTypes = {
            original: repos.filter(r => !r.fork).length,
            forked: repos.filter(r => r.fork).length
          };

          // Calculate Stars Distribution
          const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
          const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

          // Get Top Repositories
          const topRepos = repos
            .filter(r => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5)
            .map(r => ({
              name: r.name,
              description: r.description,
              stars: r.stargazers_count,
              forks: r.forks_count,
              language: r.language,
              url: r.html_url,
              updated_at: r.updated_at
            }));

          // Fetch Events (for commit count approximation)
          const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'RecruitHirePro'
            }
          });

          const events = await eventsResponse.json();
          const pushEvents = Array.isArray(events) ? events.filter(e => e.type === 'PushEvent') : [];
          const totalCommits = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

          // Calculate Activity Score
          const activityScore = Math.min(100, 
            (userData.public_repos * 2) + 
            (totalStars * 5) + 
            (totalForks * 3) + 
            (userData.followers * 4) + 
            (totalCommits * 0.5)
          );

          github_analytics = {
            profile: {
              username: userData.login,
              name: userData.name,
              avatar_url: userData.avatar_url,
              bio: userData.bio,
              location: userData.location,
              company: userData.company,
              public_repos: userData.public_repos,
              followers: userData.followers,
              following: userData.following,
              created_at: userData.created_at
            },
            statistics: {
              total_repos: repos.length,
              original_repos: repoTypes.original,
              forked_repos: repoTypes.forked,
              total_stars: totalStars,
              total_forks: totalForks,
              total_commits_recent: totalCommits,
              activity_score: Math.round(activityScore)
            },
            languages: languagePercentages,
            top_repos: topRepos,
            repo_type_distribution: repoTypes
          };
        }
      } catch (githubError) {
        console.error('GitHub API Error:', githubError);
        // Continue without GitHub analytics
      }
    }

    return NextResponse.json({
      student,
      github_analytics
    });

  } catch (error) {
    console.error(' Error fetching student profile:', error);
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}
