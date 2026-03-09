import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatRippleModule],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="!open">
        <div class="sidebar-top">
          <div class="wordmark" *ngIf="open">
            <span class="wm-main">LEARN</span><span class="wm-accent">FLOW</span>
          </div>
          <button class="toggle-btn" (click)="open = !open">
            <mat-icon>{{ open ? 'chevron_left' : 'chevron_right' }}</mat-icon>
          </button>
        </div>

        <div class="sidebar-label" *ngIf="open">NAVIGATION</div>

        <nav class="nav">
          <a *ngFor="let item of nav"
             [routerLink]="item.path"
             routerLinkActive="nav-active"
             class="nav-item"
             matRipple [matRippleColor]="'rgba(217,123,42,0.12)'">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label" *ngIf="open">{{ item.label }}</span>
            <span class="nav-tag" *ngIf="open && item.tag">{{ item.tag }}</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="open">
          <div class="sys-row">
            <span class="sys-dot"></span>
            <span class="sys-text">System Online</span>
          </div>
          <div class="sys-time">{{ now | date:'HH:mm' }} IST</div>
        </div>
      </aside>

      <!-- Main -->
      <div class="main-wrap">
        <header class="topbar">
          <div class="topbar-left">
            <div class="breadcrumb">
              <span class="bc-root">LEARNFLOW</span>
              <span class="bc-sep">/</span>
              <span class="bc-current">{{ currentLabel }}</span>
            </div>
          </div>
          <div class="topbar-right">
            <div class="tbar-date">{{ now | date:'EEE dd MMM yyyy' | uppercase }}</div>
            <div class="tbar-divider"></div>
            <div class="tbar-user">
              <div class="user-dot">A</div>
              <span class="user-name">Admin</span>
            </div>
          </div>
        </header>
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display: flex; height: 100vh; overflow: hidden; background: var(--bg); }

    /* ── Sidebar ─────────────────── */
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: var(--bg);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.2s, min-width 0.2s;
      overflow: hidden;
    }
    .sidebar.collapsed { width: 56px; min-width: 56px; }

    .sidebar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 14px 16px;
      border-bottom: 1px solid var(--border);
      min-height: 60px;
    }
    .wordmark { line-height: 1; }
    .wm-main { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: 0.05em; }
    .wm-accent { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 900; color: var(--accent); letter-spacing: 0.05em; }
    .toggle-btn {
      background: none; border: none; cursor: pointer; color: var(--text3);
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      transition: color 0.15s;
    }
    .toggle-btn:hover { color: var(--accent); }

    .sidebar-label {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      color: var(--text3); padding: 16px 14px 6px;
    }

    .nav { flex: 1; padding: 4px 8px; display: flex; flex-direction: column; gap: 2px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 8px; text-decoration: none;
      color: var(--text2); border-left: 2px solid transparent;
      transition: all 0.12s; position: relative;
    }
    .nav-item:hover { color: var(--text); background: var(--bg3); }
    .nav-item.nav-active { color: var(--accent); border-left-color: var(--accent); background: var(--accent-bg); }
    .nav-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .nav-label { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 0.03em; flex: 1; }
    .nav-tag { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--accent); background: var(--accent-bg); padding: 1px 5px; }

    .sidebar-footer { padding: 14px; border-top: 1px solid var(--border); }
    .sys-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .sys-dot { width: 6px; height: 6px; background: var(--green); border-radius: 50%; box-shadow: 0 0 6px var(--green); }
    .sys-text { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--green); }
    .sys-time { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text3); }

    /* ── Topbar ─────────────────── */
    .main-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .topbar {
      height: 48px; min-height: 48px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }
    .breadcrumb { display: flex; align-items: center; gap: 8px; }
    .bc-root { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text3); }
    .bc-sep { color: var(--border2); font-size: 14px; }
    .bc-current { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: var(--text2); letter-spacing: 0.06em; text-transform: uppercase; }

    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .tbar-date { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text3); }
    .tbar-divider { width: 1px; height: 20px; background: var(--border); }
    .tbar-user { display: flex; align-items: center; gap: 8px; }
    .user-dot {
      width: 28px; height: 28px; background: var(--accent); color: #111;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 900;
    }
    .user-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; color: var(--text2); }

    /* ── Content ─────────────────── */
    .content { flex: 1; overflow: auto; padding: 28px 32px; }
  `],
})
export class AppComponent {
  open = true;
  now = new Date();
  nav = [
    { path: '/dashboard', label: 'Dashboard', icon: 'equalizer', tag: '' },
    { path: '/courses',   label: 'Courses',   icon: 'layers',    tag: 'CRUD' },
    { path: '/students',  label: 'Students',  icon: 'group',     tag: '' },
    { path: '/enrollment',label: 'Enrollment',icon: 'task_alt',  tag: '' },
  ];
  get currentLabel() {
    const p = window.location.pathname.replace('/', '') || 'dashboard';
    return p.split('/')[0].toUpperCase();
  }
}
