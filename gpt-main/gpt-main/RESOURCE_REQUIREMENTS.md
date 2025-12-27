# OPEX Manager - Full Scale Resource Requirements

**Version**: 2.0  
**Last Updated**: December 27, 2025  
**Document Type**: Infrastructure Planning

---

## 📋 Executive Summary

This document outlines the resource requirements to run the OPEX Management System at full scale in a production environment. The application is a full-stack enterprise budget management system built with React, Node.js, Express, Prisma, and SQLite/PostgreSQL.

---

## 🎯 Application Overview

### Architecture Components
- **Frontend**: React 18 + Vite (SPA)
- **Backend**: Node.js + Express.js (REST API)
- **Database**: SQLite (dev) / PostgreSQL (production recommended)
- **Cache**: Redis (optional but recommended)
- **File Processing**: ExcelJS for large file imports

### Key Features
- Budget management with Excel import/export
- Purchase Order tracking
- Actuals management
- Real-time analytics and reporting
- Multi-user support with RBAC
- Audit logging and activity tracking

---

## 💻 Server Requirements

### 1. **Development Environment** (Small Scale - 1-10 Users)

#### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 vCPUs | 4 vCPUs |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **Network** | 100 Mbps | 1 Gbps |

#### Software Stack
- **OS**: Windows Server 2019+, Ubuntu 20.04+, or CentOS 8+
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Database**: SQLite (file-based)
- **Redis**: Optional

#### Estimated Costs (Cloud - AWS/Azure/GCP)
- **Instance Type**: t3.medium (AWS) / B2s (Azure) / e2-medium (GCP)
- **Monthly Cost**: $30-50 USD

---

### 2. **Production Environment** (Medium Scale - 50-100 Users)

#### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 vCPUs | 8 vCPUs |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 100 GB SSD | 250 GB SSD |
| **Network** | 1 Gbps | 10 Gbps |

#### Software Stack
- **OS**: Ubuntu 22.04 LTS / Windows Server 2022
- **Node.js**: v18.x LTS or v20.x LTS
- **Database**: PostgreSQL 15+ (recommended) or MySQL 8+
- **Redis**: v7.x (for caching and session management)
- **Reverse Proxy**: Nginx or Apache
- **SSL/TLS**: Let's Encrypt or commercial certificate

#### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                   (Nginx/HAProxy)                        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  App Server 1 │ │  App Server 2 │ │  App Server 3 │
│  (Node.js)    │ │  (Node.js)    │ │  (Node.js)    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  PostgreSQL   │ │     Redis     │ │  File Storage │
│   (Primary)   │ │    (Cache)    │ │     (S3)      │
└───────────────┘ └───────────────┘ └───────────────┘
```

#### Estimated Costs (Cloud)
- **App Servers**: 2-3x t3.large (AWS) @ $70/month each = $140-210
- **Database**: RDS PostgreSQL db.t3.large @ $120/month
- **Redis**: ElastiCache t3.medium @ $50/month
- **Load Balancer**: ALB @ $20/month
- **Storage**: 250GB EBS @ $25/month
- **Bandwidth**: ~$50/month
- **Total**: **$405-475 USD/month**

---

### 3. **Enterprise Environment** (Large Scale - 500+ Users)

#### Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 16 vCPUs | 32 vCPUs |
| **RAM** | 32 GB | 64 GB |
| **Storage** | 500 GB SSD | 1 TB NVMe SSD |
| **Network** | 10 Gbps | 25 Gbps |

#### Software Stack
- **OS**: Ubuntu 22.04 LTS (preferred for containerization)
- **Container Orchestration**: Kubernetes or Docker Swarm
- **Database**: PostgreSQL 15+ with read replicas
- **Cache**: Redis Cluster (3+ nodes)
- **Message Queue**: RabbitMQ or AWS SQS (for async processing)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **CDN**: CloudFlare or AWS CloudFront

#### High Availability Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    CDN (CloudFlare)                      │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              Load Balancer (Multi-AZ)                    │
│                   (AWS ALB/NLB)                          │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  Auto-Scaling │ │  Auto-Scaling │ │  Auto-Scaling │
│  Group (AZ-1) │ │  Group (AZ-2) │ │  Group (AZ-3) │
│  3-10 Nodes   │ │  3-10 Nodes   │ │  3-10 Nodes   │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  PostgreSQL   │ │ Redis Cluster │ │  S3/Object    │
│  Primary +    │ │  (3 nodes)    │ │   Storage     │
│  2 Replicas   │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

#### Kubernetes Deployment (Recommended)
- **Master Nodes**: 3x (for HA control plane)
- **Worker Nodes**: 6-20x (auto-scaling based on load)
- **Node Size**: 8 vCPU, 16 GB RAM per worker node

#### Estimated Costs (Cloud - AWS)
- **EKS Cluster**: $75/month (control plane)
- **Worker Nodes**: 10x t3.xlarge @ $150/month each = $1,500
- **RDS PostgreSQL**: db.r5.2xlarge (Multi-AZ) @ $800/month
- **ElastiCache Redis**: cache.r5.xlarge (cluster mode) @ $400/month
- **Load Balancer**: ALB + NLB @ $50/month
- **S3 Storage**: 1TB @ $25/month
- **CloudFront CDN**: ~$100/month
- **Monitoring & Logging**: $200/month
- **Bandwidth**: ~$500/month
- **Total**: **$3,650-4,500 USD/month**

---

## 🗄️ Database Requirements

### SQLite (Development Only)
- **File Size**: 100 MB - 2 GB (depending on data volume)
- **Concurrent Users**: Max 10-20 (not recommended for production)
- **Backup**: Simple file copy
- **Limitations**: Single-file, limited concurrency

### PostgreSQL (Production Recommended)

#### Small Scale (1-10k records/month)
- **Instance**: 2 vCPU, 4 GB RAM
- **Storage**: 50 GB SSD
- **IOPS**: 3,000 provisioned
- **Connections**: 100 max

#### Medium Scale (10k-100k records/month)
- **Instance**: 4 vCPU, 16 GB RAM
- **Storage**: 250 GB SSD
- **IOPS**: 10,000 provisioned
- **Connections**: 500 max
- **Read Replicas**: 1-2 (optional)

#### Large Scale (100k+ records/month)
- **Instance**: 8-16 vCPU, 64 GB RAM
- **Storage**: 1 TB NVMe SSD
- **IOPS**: 20,000+ provisioned
- **Connections**: 1,000 max
- **Read Replicas**: 2-3 (required)
- **Backup**: Automated daily with point-in-time recovery

### Database Growth Estimates
| Users | Records/Month | Storage/Year | Backup Size |
|-------|---------------|--------------|-------------|
| 10 | 1,000 | 500 MB | 100 MB |
| 50 | 5,000 | 2 GB | 500 MB |
| 100 | 10,000 | 5 GB | 1 GB |
| 500 | 50,000 | 25 GB | 5 GB |
| 1,000+ | 100,000+ | 50+ GB | 10+ GB |

---

## 🚀 Redis Cache Requirements

### Development
- **Instance**: 1 GB RAM
- **Persistence**: Optional
- **Cost**: Free (local) or $10/month (cloud)

### Production (Medium Scale)
- **Instance**: 4 GB RAM
- **Persistence**: RDB + AOF
- **Replication**: Master-Replica setup
- **Cost**: $50-100/month

### Production (Large Scale)
- **Cluster**: 3+ nodes, 8 GB RAM each
- **Persistence**: RDB + AOF
- **Replication**: Multi-AZ
- **Cost**: $400-600/month

---

## 📊 Network & Bandwidth Requirements

### Expected Traffic Patterns
| Scale | Concurrent Users | Requests/Second | Bandwidth |
|-------|------------------|-----------------|-----------|
| Small | 10-20 | 10-50 | 10 Mbps |
| Medium | 50-100 | 100-500 | 100 Mbps |
| Large | 500+ | 1,000-5,000 | 1 Gbps+ |

### Data Transfer Estimates
- **API Calls**: ~5-10 KB per request
- **Excel Import**: 1-50 MB per file
- **Excel Export**: 1-100 MB per file
- **Dashboard Load**: ~500 KB initial, ~50 KB updates
- **Monthly Transfer**: 50 GB (small), 500 GB (medium), 5 TB (large)

---

## 🔒 Security & Compliance Requirements

### Infrastructure Security
- **Firewall**: WAF (Web Application Firewall)
- **DDoS Protection**: CloudFlare or AWS Shield
- **SSL/TLS**: TLS 1.3 with strong cipher suites
- **VPN**: For admin access to backend systems
- **Secrets Management**: AWS Secrets Manager or HashiCorp Vault

### Backup & Disaster Recovery
- **Database Backups**: Daily automated backups with 30-day retention
- **Application Backups**: Weekly full backups
- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 1 hour
- **Geo-Redundancy**: Multi-region deployment for critical systems

### Monitoring & Alerting
- **Uptime Monitoring**: Pingdom, UptimeRobot, or AWS CloudWatch
- **Application Monitoring**: New Relic, Datadog, or Prometheus
- **Log Aggregation**: ELK Stack or CloudWatch Logs
- **Alert Channels**: Email, Slack, PagerDuty

---

## 🐳 Docker Deployment Requirements

### Container Resources (per service)

#### Frontend Container
- **CPU**: 0.5 vCPU
- **RAM**: 512 MB
- **Replicas**: 2-3 (for HA)

#### Backend Container
- **CPU**: 1-2 vCPU
- **RAM**: 2-4 GB
- **Replicas**: 3-10 (auto-scaling)

#### Redis Container
- **CPU**: 0.5 vCPU
- **RAM**: 1-4 GB
- **Replicas**: 1-3 (cluster mode)

### Docker Compose (Development)
```yaml
services:
  app:
    cpu_count: 2
    mem_limit: 4g
  redis:
    cpu_count: 1
    mem_limit: 1g
```

### Kubernetes Resources (Production)
```yaml
resources:
  requests:
    cpu: 1000m
    memory: 2Gi
  limits:
    cpu: 2000m
    memory: 4Gi
```

---

## 💰 Cost Summary

### Monthly Operating Costs

#### Small Scale (10-50 Users)
| Component | Cost |
|-----------|------|
| App Server | $50 |
| Database (SQLite/Small PG) | $30 |
| Redis (optional) | $10 |
| Storage | $10 |
| Bandwidth | $10 |
| **Total** | **$110/month** |

#### Medium Scale (50-200 Users)
| Component | Cost |
|-----------|------|
| App Servers (2-3x) | $210 |
| Database (PostgreSQL) | $120 |
| Redis | $50 |
| Load Balancer | $20 |
| Storage | $25 |
| Bandwidth | $50 |
| Monitoring | $30 |
| **Total** | **$505/month** |

#### Large Scale (500-2000 Users)
| Component | Cost |
|-----------|------|
| Kubernetes Cluster | $1,575 |
| Database (HA PostgreSQL) | $800 |
| Redis Cluster | $400 |
| Load Balancer | $50 |
| Storage (S3 + EBS) | $100 |
| CDN | $100 |
| Monitoring & Logging | $200 |
| Bandwidth | $500 |
| **Total** | **$3,725/month** |

#### Enterprise Scale (2000+ Users)
| Component | Cost |
|-----------|------|
| Kubernetes Cluster (Multi-AZ) | $3,000 |
| Database (Multi-Region HA) | $1,500 |
| Redis Cluster | $600 |
| Load Balancer + WAF | $200 |
| Storage | $200 |
| CDN | $300 |
| Monitoring & Logging | $500 |
| Bandwidth | $1,000 |
| Security & Compliance | $500 |
| **Total** | **$7,800/month** |

---

## 📈 Performance Benchmarks

### Expected Response Times
| Operation | Target | Acceptable |
|-----------|--------|------------|
| Page Load | < 1s | < 2s |
| API Call | < 200ms | < 500ms |
| Excel Import (1k rows) | < 5s | < 10s |
| Excel Import (10k rows) | < 30s | < 60s |
| Report Generation | < 3s | < 5s |
| Dashboard Refresh | < 1s | < 2s |

### Scalability Metrics
- **Horizontal Scaling**: Add more app server nodes
- **Vertical Scaling**: Increase CPU/RAM per node
- **Database Scaling**: Read replicas + connection pooling
- **Cache Hit Ratio**: Target 80%+ for frequently accessed data

---

## 🛠️ Deployment Options

### Option 1: Traditional VPS/Dedicated Server
**Pros**: Full control, predictable costs  
**Cons**: Manual scaling, maintenance overhead  
**Best For**: Small to medium deployments  
**Providers**: DigitalOcean, Linode, Vultr  

### Option 2: Cloud Platform (AWS/Azure/GCP)
**Pros**: Auto-scaling, managed services, global reach  
**Cons**: Complex pricing, potential vendor lock-in  
**Best For**: Medium to large deployments  
**Providers**: AWS, Azure, Google Cloud  

### Option 3: Platform-as-a-Service (PaaS)
**Pros**: Easy deployment, minimal DevOps  
**Cons**: Less control, higher costs per user  
**Best For**: Quick deployment, small teams  
**Providers**: Heroku, Railway, Render, Fly.io  

### Option 4: Containerized (Docker + Kubernetes)
**Pros**: Portable, scalable, efficient resource usage  
**Cons**: Steep learning curve, complex setup  
**Best For**: Large scale, multi-environment deployments  
**Providers**: AWS EKS, Azure AKS, Google GKE, DigitalOcean Kubernetes  

---

## 📋 Recommended Deployment Strategy

### Phase 1: MVP/Pilot (0-3 months)
- **Platform**: Railway, Render, or Heroku
- **Scale**: Small (10-20 users)
- **Cost**: $50-100/month
- **Database**: PostgreSQL (managed)
- **Focus**: Rapid iteration, user feedback

### Phase 2: Production Launch (3-6 months)
- **Platform**: AWS/Azure/GCP
- **Scale**: Medium (50-100 users)
- **Cost**: $400-600/month
- **Database**: PostgreSQL with backups
- **Redis**: Enabled for caching
- **Focus**: Stability, performance monitoring

### Phase 3: Scale-Up (6-12 months)
- **Platform**: Kubernetes on cloud
- **Scale**: Large (500+ users)
- **Cost**: $3,000-5,000/month
- **Database**: HA PostgreSQL with replicas
- **Redis**: Cluster mode
- **CDN**: Enabled
- **Focus**: High availability, global reach

### Phase 4: Enterprise (12+ months)
- **Platform**: Multi-region Kubernetes
- **Scale**: Enterprise (2000+ users)
- **Cost**: $7,000-10,000/month
- **Database**: Multi-region HA
- **Redis**: Global cluster
- **CDN**: Multi-region
- **Focus**: 99.99% uptime, compliance, security

---

## 🔧 Optimization Recommendations

### Application Level
1. **Enable Redis caching** for frequently accessed data
2. **Implement pagination** for large datasets (already done)
3. **Use database indexes** on frequently queried fields (already done)
4. **Compress API responses** with gzip/brotli
5. **Lazy load** components and routes
6. **Optimize Excel processing** with streaming for large files

### Infrastructure Level
1. **Use CDN** for static assets (images, CSS, JS)
2. **Enable HTTP/2** or HTTP/3
3. **Implement connection pooling** for database
4. **Use read replicas** for reporting queries
5. **Auto-scaling** based on CPU/memory metrics
6. **Database query optimization** and regular VACUUM

### Monitoring & Maintenance
1. **Set up alerts** for high CPU, memory, disk usage
2. **Monitor database slow queries**
3. **Track API response times**
4. **Regular security updates**
5. **Automated backups** with tested restore procedures
6. **Capacity planning** based on growth trends

---

## 📞 Support & Maintenance Requirements

### Staffing Needs

#### Small Scale
- **DevOps**: Part-time or outsourced
- **Support**: 1 person (part-time)
- **Development**: 1-2 developers

#### Medium Scale
- **DevOps**: 1 full-time engineer
- **Support**: 1-2 full-time staff
- **Development**: 2-3 developers
- **DBA**: Part-time or on-call

#### Large Scale
- **DevOps**: 2-3 engineers (24/7 on-call rotation)
- **Support**: 3-5 staff (tiered support)
- **Development**: 5-10 developers
- **DBA**: 1-2 full-time
- **Security**: 1 security engineer

### Maintenance Windows
- **Small**: Weekly, off-hours
- **Medium**: Bi-weekly, scheduled maintenance
- **Large**: Rolling updates, zero-downtime deployments

---

## 🎯 Conclusion

### Recommended Starting Point
For most organizations, we recommend starting with:
- **Platform**: AWS/Azure/GCP or Railway (for quick start)
- **Scale**: Medium (50-100 users)
- **Budget**: $400-600/month
- **Architecture**: 2-3 app servers, PostgreSQL, Redis, Load Balancer

### Scaling Path
1. **Start small** with managed services (Railway, Heroku)
2. **Migrate to cloud** (AWS/Azure/GCP) as you grow
3. **Implement Kubernetes** when you reach 500+ users
4. **Add redundancy** and multi-region as needed

### Key Success Factors
✅ **Monitor everything** from day one  
✅ **Automate deployments** with CI/CD  
✅ **Plan for growth** with scalable architecture  
✅ **Regular backups** and disaster recovery testing  
✅ **Security first** approach with regular audits  

---

**Document Version**: 1.0  
**Prepared By**: Infrastructure Team  
**Review Date**: Quarterly  
**Next Review**: March 2026

---

## 📚 Additional Resources

- [Docker Quick Start Guide](./DOCKER_QUICK_START.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [README](./README.md)

---

**For questions or clarifications, contact your DevOps team or infrastructure lead.**
