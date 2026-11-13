<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Per-school configuration of the Departmental Achievements page
// (TOPCIT for SCS, LET for SED, ...). `fields` drives the Dean's form,
// so a System Admin screen can edit it later without code changes.
class AchievementModule extends Model
{
    protected $fillable = ['school_id', 'code', 'name', 'kind', 'description', 'fields', 'is_active', 'sort_order'];

    protected $casts = ['fields' => 'array', 'is_active' => 'boolean'];

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
